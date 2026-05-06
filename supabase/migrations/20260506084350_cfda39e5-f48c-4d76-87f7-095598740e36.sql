
-- Allow hosts to update reports concerning their events or galleries
CREATE POLICY "reports_update_host" ON public.reports FOR UPDATE USING (
  (event_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_host_member(e.host_id, auth.uid(), NULL)))
  OR (gallery_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.gallery g JOIN public.events e ON e.id = g.event_id
    WHERE g.id = gallery_id AND public.is_host_member(e.host_id, auth.uid(), NULL)
  ))
);

-- Allow hosts to delete (reject) gallery photos for their events
CREATE POLICY "gallery_delete_host" ON public.gallery FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_host_member(e.host_id, auth.uid(), NULL))
);

-- Seed: past event for existing host
INSERT INTO public.events (id, host_id, title, description, cover_image_url, start_time, end_time, timezone, venue_address, is_online, online_link, capacity, visibility, status)
VALUES (
  'aaaaaaaa-1111-2222-3333-444444444444',
  'e07dc538-b758-43e5-b14c-492fb56cf208',
  'Past Demo: Spring Founders Mixer',
  'A great evening of networking and lightning talks. This is a sample past event used for demo purposes.',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
  '2026-04-15 18:00:00+00',
  '2026-04-15 21:00:00+00',
  'Europe/Berlin',
  'Berlin, Germany',
  false,
  NULL,
  100,
  'public',
  'published'
)
ON CONFLICT (id) DO NOTHING;

-- Sample feedback
INSERT INTO public.feedback (event_id, user_id, rating, comment)
VALUES (
  'aaaaaaaa-1111-2222-3333-444444444444',
  '76bae34c-ba1d-4a99-a15c-7f8fbd655cf9',
  5,
  'Fantastic event — great speakers and lovely venue!'
)
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Sample approved gallery photo
INSERT INTO public.gallery (event_id, user_id, image_url, approved)
SELECT
  'aaaaaaaa-1111-2222-3333-444444444444',
  '76bae34c-ba1d-4a99-a15c-7f8fbd655cf9',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.gallery
  WHERE event_id = 'aaaaaaaa-1111-2222-3333-444444444444'
    AND image_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'
);
