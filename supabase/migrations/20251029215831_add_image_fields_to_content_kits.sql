-- Add image_url and image_prompt fields to content_kits table
ALTER TABLE public.content_kits
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_prompt TEXT;

-- Add comment to describe the fields
COMMENT ON COLUMN public.content_kits.image_url IS 'URL of the AI-generated image for the content kit';
COMMENT ON COLUMN public.content_kits.image_prompt IS 'Prompt used to generate the image';
