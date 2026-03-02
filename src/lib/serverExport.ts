import { toast } from 'sonner';
import html2canvas from 'html2canvas';

/**
 * Tries server-side export first. If server is unavailable (404),
 * falls back to client-side html2canvas capture.
 */
export async function serverExport(
  type: string,
  state: object,
  filename: string,
  fallbackRef?: React.RefObject<HTMLDivElement>
) {
  const toastId = toast.loading('Gerando JPG...');
  try {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, state }),
    });

    if (res.status === 404) {
      // Server not available — use client-side fallback
      if (!fallbackRef?.current) {
        throw new Error('Servidor indisponível e canvas não encontrado para fallback');
      }
      toast.loading('Servidor indisponível, exportando via navegador...', { id: toastId });
      const canvas = await html2canvas(fallbackRef.current, {
        width: 1280,
        height: 720,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error('Falha ao gerar imagem', { id: toastId });
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('JPG exportado (via navegador)!', { id: toastId });
        },
        'image/jpeg',
        0.9
      );
      return;
    }

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
