import { toast } from 'sonner';

export async function serverExport(type: string, state: object, filename: string) {
  const toastId = toast.loading('Gerando JPG via servidor...');
  try {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, state }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Export failed: ${res.status} ${text}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('JPG exportado!', { id: toastId });
  } catch (error) {
    console.error('Server export error:', error);
    toast.error('Falha ao exportar JPG', { id: toastId });
    throw error;
  }
}
