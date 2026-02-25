

## Plan: Upload to Storage and Return Public URL

### Problem
The edge function currently returns raw PNG binary, which causes JSON parsing errors in Airtable. Airtable needs a public URL to save attachments.

### Changes

#### 1. Create Storage Bucket `thumbnails` (SQL Migration)
Create a public bucket called `thumbnails` with a permissive insert policy so the edge function (using the service role key) can upload files.

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);
```

#### 2. Update `supabase/functions/generate-ao-vivo/index.ts`

After generating the PNG buffer (line 168), instead of returning the binary directly:

1. Import `createClient` from `@supabase/supabase-js`
2. Create a Supabase client using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (both already available as secrets)
3. Generate a unique filename using timestamp + random string (e.g., `ao-vivo/1772058562515-abc123.png`)
4. Upload the PNG buffer to the `thumbnails` bucket via `supabase.storage.from('thumbnails').upload(...)`
5. Get the public URL via `supabase.storage.from('thumbnails').getPublicUrl(...)`
6. Return a JSON response: `{ "url": "https://...supabase.co/storage/v1/object/public/thumbnails/ao-vivo/..." }`

The response will change from `Content-Type: image/png` to `Content-Type: application/json`.

### Technical Details

- **Service Role Key**: Used server-side to bypass RLS for the upload. Already configured as a secret (`SUPABASE_SERVICE_ROLE_KEY`).
- **File naming**: `ao-vivo/{timestamp}-{random}.png` to avoid collisions.
- **Bucket is public**: So the returned URL is directly accessible without auth tokens -- exactly what Airtable needs.
- **No RLS policies needed on storage.objects** for this bucket since uploads happen via service role key (bypasses RLS) and reads are public.

