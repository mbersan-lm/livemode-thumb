import { toast } from 'sonner';

const API_BASE = (import.meta.env.VITE_EXPORT_API_BASE || '').replace(/\/$/, '');

export async function serverExport(type: string, state: object, filename: string) {
  const url = `${API_BASE}/api/export`;
  const toastId = toast.loading('Gerando JPG via servidor...');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, state }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Export failed: ${res.status} ${text}`);
    }

    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    toast.success('JPG exportado!', { id: toastId });
  } catch (error) {
    console.error('Server export error:', error);
    toast.error('Falha ao exportar JPG', { id: toastId });
    throw error;
  }
}
