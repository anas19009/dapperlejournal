ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
                                           
CREATE POLICY "Public can read comments"
  ON public.comments FOR SELECT USING (true);
                                                         
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);
                                                  
CREATE POLICY "Authors and admins can delete own comments"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'author')
    )
  );
                            
CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
