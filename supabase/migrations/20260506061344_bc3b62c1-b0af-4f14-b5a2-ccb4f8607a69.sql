
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_host_member(uuid, uuid, text) FROM PUBLIC, anon;

DROP POLICY "hosts_insert_authenticated" ON public.hosts;
CREATE POLICY "hosts_insert_authenticated" ON public.hosts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
