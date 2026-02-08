-- Create the 'invoices' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files to the 'invoices' bucket
CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'invoices' );

-- Policy: Allow authenticated users to accept/read files from the 'invoices' bucket
CREATE POLICY "Authenticated users can view invoices"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'invoices' );

-- Policy: Allow authenticated users to update files in the 'invoices' bucket
CREATE POLICY "Authenticated users can update invoices"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'invoices' );

-- Policy: Allow authenticated users to delete files in the 'invoices' bucket
CREATE POLICY "Authenticated users can delete invoices"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'invoices' );
