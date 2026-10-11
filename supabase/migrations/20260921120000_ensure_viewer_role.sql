                                                                                                    
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'viewer',
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'author', 'viewer'));
