                                                    

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'viewer',
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'author', 'viewer'));

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

CREATE POLICY "Authors and admins can delete own comments"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'author')
    )
  );