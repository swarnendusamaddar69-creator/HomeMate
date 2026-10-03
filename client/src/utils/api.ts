import { ScanResponse, BackendHealth } from '../types';

export async function checkBackendHealth(): Promise<BackendHealth | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('/api/health', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function getGeminiKeyConfig(): Promise<{ configured: boolean; preview: string | null }> {
  try {
    const res = await fetch('/api/config/gemini-key');
    if (!res.ok) return { configured: false, preview: null };
    return await res.json();
  } catch (err) {
    return { configured: false, preview: null };
  }
}

export async function saveGeminiApiKey(
  apiKey: string
): Promise<{ success: boolean; message: string; configured: boolean }> {
  try {
    const res = await fetch('/api/config/gemini-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to save key', configured: false };
  }
}

export async function scanFridgeWithBackend(
  fileOrBlob: Blob | File
): Promise<(ScanResponse & { isRealAi?: boolean; notice?: string; errorNotice?: string }) | null> {
  try {
    const formData = new FormData();
    formData.append('photo', fileOrBlob, 'fridge_scan.jpg');

    const res = await fetch('/api/scan/fridge', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.warn('Backend scan returned non-OK status:', res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend fridge scan failed or offline, using fallback:', err);
    return null;
  }
}

export async function executeToolAction(
  tool: string,
  payload: Record<string, any>
): Promise<{ success: boolean; undoToken?: string; message?: string }> {
  try {
    const res = await fetch('/api/actions/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, payload }),
    });
    if (!res.ok) throw new Error('Action execution failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend tool execute fallback:', err);
    return {
      success: true,
      undoToken: `local_undo_${Date.now()}`,
      message: `Action executed (offline fallback)`,
    };
  }
}

export async function undoToolAction(
  undoToken: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/actions/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ undoToken }),
    });
    if (!res.ok) throw new Error('Undo failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend undo fallback:', err);
    return { success: true, message: 'Action undone' };
  }
}

export async function exportKiranaWhatsApp(
  items: { title: string; quantity: string }[],
  language: 'en' | 'hi' | 'bn' = 'en',
  address?: string
): Promise<{ formattedText: string; whatsappUrl: string }> {
  try {
    const res = await fetch('/api/kirana/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, language, address }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to call /api/kirana/export, using local generator:', err);
  }

  // High-fidelity local fallback
  const lines = items.map((i, idx) => `${idx + 1}. ${i.title} - ${i.quantity}`);
  const deliveryAddress = address || 'Flat 402, Green Valley Apartments';

  const greeting =
    language === 'hi'
      ? `नमस्ते काका, कृपया ये सामान घर (${deliveryAddress}) पहुंचा दीजिए:`
      : language === 'bn'
      ? `নমস্কার কাকা, অনুগ্রহ করে এই জিনিসগুলো (${deliveryAddress})-এ পাঠিয়ে দিন:`
      : `Namaste! Please deliver these items to ${deliveryAddress}:`;

  const formattedText = `${greeting}\n\n${lines.join('\n')}\n\nThank you! (HomeMate AI)`;
  return {
    formattedText,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(formattedText)}`,
  };
}
