                                                                   

                                                                                

                                                                            
ALTER TABLE public.ai_books
  ADD COLUMN IF NOT EXISTS extracted_text TEXT NOT NULL DEFAULT '';

                                                                                 
ALTER TABLE public.ai_books
  ALTER COLUMN extracted_text DROP DEFAULT;

                       
ALTER TABLE public.ai_books
  DROP COLUMN IF EXISTS file_url,
  DROP COLUMN IF EXISTS file_size;

                                                      
ALTER TABLE public.ai_books
  ADD COLUMN IF NOT EXISTS word_count INTEGER GENERATED ALWAYS AS
    (
      CASE
        WHEN btrim(extracted_text) = '' THEN 0
        ELSE cardinality(regexp_split_to_array(btrim(extracted_text), E'\\s+'))
      END
    ) STORED;

ALTER TABLE public.ai_books
  ADD COLUMN IF NOT EXISTS char_count INTEGER GENERATED ALWAYS AS
    (char_length(extracted_text)) STORED;

                                                                                

ALTER TABLE public.ai_chats
  DROP CONSTRAINT IF EXISTS ai_chats_llm_provider_check;

ALTER TABLE public.ai_chats
  ADD CONSTRAINT ai_chats_llm_provider_check
  CHECK (llm_provider IN ('claude', 'gemini', 'openai'));

                                                                                

ALTER TABLE public.llm_provider_keys
  DROP CONSTRAINT IF EXISTS llm_provider_keys_provider_check;

ALTER TABLE public.llm_provider_keys
  ADD CONSTRAINT llm_provider_keys_provider_check
  CHECK (provider IN ('claude', 'gemini', 'openai'));
