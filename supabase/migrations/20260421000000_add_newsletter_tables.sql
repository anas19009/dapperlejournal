                                               
                                   
                      
                                               

                                               
         
                                               

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email             TEXT        NOT NULL,
  subscribed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at   TIMESTAMPTZ,
  unsubscribe_token TEXT        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
                                                                                                   
  post_id              UUID        NOT NULL UNIQUE REFERENCES public.posts(id) ON DELETE CASCADE,
  scheduled_at         TIMESTAMPTZ NOT NULL,
  status               TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  sending_started_at   TIMESTAMPTZ,
  sent_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

                                               
          
                                               

                                                                                             
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscriptions_email_lower_idx
  ON public.newsletter_subscriptions (lower(email));

CREATE INDEX IF NOT EXISTS newsletter_sends_pending_scheduled_idx
  ON public.newsletter_sends (scheduled_at)
  WHERE status = 'pending';

                                               
           
                                               

DROP TRIGGER IF EXISTS newsletter_subscriptions_updated_at ON public.newsletter_subscriptions;
CREATE TRIGGER newsletter_subscriptions_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

                                               
      
                                               

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sends         ENABLE ROW LEVEL SECURITY;

                                                         
                                                                 
