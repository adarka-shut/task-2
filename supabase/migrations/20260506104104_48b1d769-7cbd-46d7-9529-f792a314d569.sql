DROP POLICY IF EXISTS invite_links_select_member ON public.invite_links;
CREATE POLICY invite_links_select_authenticated ON public.invite_links FOR SELECT TO authenticated USING (true);
CREATE POLICY invite_links_update_used_by ON public.invite_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);