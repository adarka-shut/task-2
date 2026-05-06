DROP POLICY IF EXISTS host_members_insert ON public.host_members;
CREATE POLICY host_members_insert ON public.host_members
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      role = 'host'
      OR is_host_member(host_id, auth.uid(), 'host')
      OR EXISTS (
        SELECT 1 FROM public.invite_links il
        WHERE il.host_id = host_members.host_id
          AND il.role = host_members.role
          AND il.used_by IS NULL
      )
    )
  );