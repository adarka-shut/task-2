
-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Hosts
CREATE TABLE public.hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  bio text,
  contact_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;

-- Host members
CREATE TABLE public.host_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('host','checker')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (host_id, user_id)
);
ALTER TABLE public.host_members ENABLE ROW LEVEL SECURITY;

-- Helper: is user a member with given role of host?
CREATE OR REPLACE FUNCTION public.is_host_member(_host_id uuid, _user_id uuid, _role text DEFAULT NULL)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.host_members
    WHERE host_id = _host_id AND user_id = _user_id
      AND (_role IS NULL OR role = _role)
  );
$$;

-- Hosts policies
CREATE POLICY "hosts_select_all" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "hosts_insert_authenticated" ON public.hosts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "hosts_update_by_host_role" ON public.hosts FOR UPDATE USING (public.is_host_member(id, auth.uid(), 'host'));
CREATE POLICY "hosts_delete_by_host_role" ON public.hosts FOR DELETE USING (public.is_host_member(id, auth.uid(), 'host'));

-- Host members policies
CREATE POLICY "host_members_select_own_host" ON public.host_members FOR SELECT USING (
  public.is_host_member(host_id, auth.uid(), NULL)
);
CREATE POLICY "host_members_insert" ON public.host_members FOR INSERT WITH CHECK (
  -- allow self-insert as host (used during initial host creation), or insert by existing host
  (auth.uid() = user_id AND role = 'host') OR public.is_host_member(host_id, auth.uid(), 'host')
);
CREATE POLICY "host_members_delete" ON public.host_members FOR DELETE USING (
  public.is_host_member(host_id, auth.uid(), 'host')
);

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_image_url text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  venue_address text,
  is_online boolean NOT NULL DEFAULT false,
  online_link text,
  capacity integer NOT NULL,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','unlisted')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_published_public" ON public.events FOR SELECT USING (
  (status = 'published' AND visibility = 'public')
  OR public.is_host_member(host_id, auth.uid(), NULL)
);
CREATE POLICY "events_insert_host" ON public.events FOR INSERT WITH CHECK (
  public.is_host_member(host_id, auth.uid(), 'host')
);
CREATE POLICY "events_update_host" ON public.events FOR UPDATE USING (
  public.is_host_member(host_id, auth.uid(), 'host')
);
CREATE POLICY "events_delete_host" ON public.events FOR DELETE USING (
  public.is_host_member(host_id, auth.uid(), 'host')
);

-- RSVPs
CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('confirmed','waitlisted','cancelled')),
  ticket_code text UNIQUE NOT NULL,
  checked_in boolean NOT NULL DEFAULT false,
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rsvps_select_all" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "rsvps_insert_own" ON public.rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rsvps_update_own_or_host" ON public.rsvps FOR UPDATE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_host_member(e.host_id, auth.uid(), NULL))
);

-- Feedback
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_select_all" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "feedback_insert_own" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gallery
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_select_approved_or_member" ON public.gallery FOR SELECT USING (
  approved = true
  OR auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_host_member(e.host_id, auth.uid(), NULL))
);
CREATE POLICY "gallery_insert_own" ON public.gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gallery_update_host" ON public.gallery FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_host_member(e.host_id, auth.uid(), NULL))
);

-- Reports
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  gallery_id uuid REFERENCES public.gallery(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','hidden','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_host" ON public.reports FOR SELECT USING (
  (event_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_host_member(e.host_id, auth.uid(), NULL)))
  OR (gallery_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.gallery g JOIN public.events e ON e.id = g.event_id
    WHERE g.id = gallery_id AND public.is_host_member(e.host_id, auth.uid(), NULL)
  ))
);

-- Invite links
CREATE TABLE public.invite_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('host','checker')),
  token text UNIQUE NOT NULL,
  used_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invite_links_select_member" ON public.invite_links FOR SELECT USING (
  public.is_host_member(host_id, auth.uid(), NULL)
);
CREATE POLICY "invite_links_insert_member" ON public.invite_links FOR INSERT WITH CHECK (
  public.is_host_member(host_id, auth.uid(), 'host')
);
