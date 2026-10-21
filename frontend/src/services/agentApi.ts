import { WindowsAgentStatus } from '../types';

// Bitta manzil rejimida /api/agent ga so'rov yuboriladi, agar bo'lmasa 8001 portga
const UNIFIED_AGENT_BASE = '/api/agent';
const FALLBACK_AGENT_BASE = 'http://127.0.0.1:8001';

async function tryFetchAgent(endpoint: string, options: RequestInit = {}): Promise<Response> {
  try {
    const res = await fetch(`${UNIFIED_AGENT_BASE}${endpoint}`, options);
    if (res.ok || res.status === 400 || res.status === 401) return res;
  } catch {}
  return await fetch(`${FALLBACK_AGENT_BASE}${endpoint}`, options);
}

export async function fetchAgentStatus(): Promise<WindowsAgentStatus> {
  try {
    const healthRes = await tryFetchAgent('/health', { signal: AbortSignal.timeout(2000) });
    if (!healthRes.ok) throw new Error('Agent offline');
    
    let token = '';
    try {
      const tokenRes = await tryFetchAgent('/token-info', { signal: AbortSignal.timeout(2000) });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        token = tokenData.token;
      }
    } catch {}

    let metrics: any = {};
    try {
      const infoRes = await tryFetchAgent('/system-info', { signal: AbortSignal.timeout(2000) });
      if (infoRes.ok) {
        metrics = await infoRes.json();
      }
    } catch {}

    return {
      running: true,
      token: token,
      os: metrics.os,
      cpuPercent: metrics.cpu_percent,
      memoryPercent: metrics.memory_percent,
      memoryTotalGb: metrics.memory_total_gb,
      diskPercent: metrics.disk_percent,
      battery: metrics.battery
    };
  } catch (err: any) {
    return {
      running: false,
      error: 'Windows agenti nofaol'
    };
  }
}

export async function launchWindowsAction(
  action: 'notepad' | 'calc' | 'browser_url',
  payload: Record<string, any> = {},
  token?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['X-Jarvis-Token'] = token;
    }

    const res = await tryFetchAgent('/actions/launch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, payload }),
      signal: AbortSignal.timeout(5000)
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.detail || 'Amalni bajarishda xatolik yuz berdi.'
      };
    }

    return {
      success: true,
      message: data.message || 'Muvaffaqiyatli bajarildi'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Windows agentiga ulanish imkoni bo'lmadi: ${err.message}`
    };
  }
}
