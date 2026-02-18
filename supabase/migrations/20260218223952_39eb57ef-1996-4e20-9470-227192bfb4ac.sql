
-- Create cortes_programs table
CREATE TABLE public.cortes_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  thumb_type TEXT NOT NULL DEFAULT 'pip',
  font_url TEXT,
  font_family TEXT,
  bg_url TEXT,
  logos_url TEXT,
  text_color TEXT NOT NULL DEFAULT '#F1E8D5',
  stroke_color TEXT NOT NULL DEFAULT '#0C0C20',
  pip_border_color TEXT NOT NULL DEFAULT '#D02046',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public access, no auth)
ALTER TABLE public.cortes_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read programs" ON public.cortes_programs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert programs" ON public.cortes_programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update programs" ON public.cortes_programs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete programs" ON public.cortes_programs FOR DELETE USING (true);

-- Create storage bucket for cortes assets
INSERT INTO storage.buckets (id, name, public) VALUES ('cortes-assets', 'cortes-assets', true);

-- Storage policies (public access)
CREATE POLICY "Anyone can read cortes assets" ON storage.objects FOR SELECT USING (bucket_id = 'cortes-assets');
CREATE POLICY "Anyone can upload cortes assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cortes-assets');
CREATE POLICY "Anyone can update cortes assets" ON storage.objects FOR UPDATE USING (bucket_id = 'cortes-assets');
CREATE POLICY "Anyone can delete cortes assets" ON storage.objects FOR DELETE USING (bucket_id = 'cortes-assets');
