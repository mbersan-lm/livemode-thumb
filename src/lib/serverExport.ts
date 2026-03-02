import { toast } from 'sonner';

/**
 * Exporta uma thumbnail via servidor Playwright (Railway).
 * No preview do Lovable (sem servidor), exibe aviso.
 */
export async function exportViaServer(
  type: 'cortes' | 'melhores-momentos' | 'jogo-completo' | 'ao-vivo',
  state: Record<string, any>,
  filename: string
) {
  const toastId = toast.loading('Gerando PNG via servidor...');

  try {
    const resp = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, state }),
    });

    if (resp.status === 404) {
      toast.dismiss(toastId);
      toast.error('Export server-side disponível apenas no deploy Railway. No preview do Lovable, esta funcionalidade não está ativa.', { duration: 5000 });
      return;
    }

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => 'Unknown error');
      throw new Error(`Export failed (${resp.status}): ${errorText}`);
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    toast.dismiss(toastId);
    toast.success('PNG exportado!');
  } catch (error) {
    toast.dismiss(toastId);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      toast.error('Export server-side disponível apenas no deploy Railway.', { duration: 5000 });
    } else {
      console.error('Server export error:', error);
      toast.error(`Falha ao exportar: ${(error as Error).message}`);
    }
  }
}
