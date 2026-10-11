                                                               
                                                         
                             
                                                               

                                                
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

                                                           
UPDATE public.profiles p
SET confirmed_at = u.confirmed_at
FROM auth.users u
WHERE p.id = u.id
  AND u.confirmed_at IS NOT NULL
  AND p.confirmed_at IS NULL;

                                                                     
CREATE OR REPLACE FUNCTION public.handle_user_confirmed()
RETURNS TRIGGER AS $$
BEGIN
                                                                 
  IF OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    UPDATE public.profiles
    SET confirmed_at = NEW.confirmed_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

                                         
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_user_confirmed();
