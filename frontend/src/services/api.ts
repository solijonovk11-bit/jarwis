import { ChatMessageItem, SystemMetrics } from '../types';

const BACKEND_BASE = 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{ online: boolean; aiConfigured: boolean; provider: string; model: string }> {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/system/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Status error');
    const data = await res.json();
    return {
      online: true,
      aiConfigured: data.ai_configured,
      provider: data.provider,
      model: data.model
    };
  } catch (err) {
    return {
      online: false,
      aiConfigured: false,
      provider: 'Offline',
      model: 'Kutilmoqda'
    };
  }
}

export async function sendChatMessage(message: string, sessionId = 'default'): Promise<{
  reply: string;
  provider: string;
  model: string;
  action?: string;
  actionPayload?: any;
}> {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId }),
      signal: AbortSignal.timeout(35000)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server xatosi: ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply,
      provider: data.provider,
      model: data.model,
      action: data.suggested_action,
      actionPayload: data.action_payload
    };
  } catch (err: any) {
    // Agar backend ishlamayotgan bo'lsa yoki xatolik bo'lsa
    console.warn('Backend bilan bog\'lanishda xatolik:', err);
    return {
      reply: `Janob, backend serveri (${BACKEND_BASE}) bilan aloqa uzilgan yoki javob bermadi. Iltimos, backend/main.py ishlayotganligini tekshiring.`,
      provider: 'offline-fallback',
      model: 'none'
    };
  }
}

export async function fetchHistory(sessionId = 'default'): Promise<ChatMessageItem[]> {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/chat/history?session_id=${sessionId}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.messages || []).map((m: any, idx: number) => ({
      id: `hist-${idx}-${Date.now()}`,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    }));
  } catch (err) {
    return [];
  }
}

export async function clearChatHistory(sessionId = 'default'): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/chat/history?session_id=${sessionId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(4000)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
