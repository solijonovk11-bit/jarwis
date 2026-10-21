import { WindowsAgentStatus } from '../types';

const AGENT_BASE = 'http://127.0.0.1:8001';

export async function fetchAgentStatus(): Promise<WindowsAgentStatus> {
  try {
    const healthRes = await fetch(`${AGENT_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!healthRes.ok) throw new Error('Agent offline');
    
    // Tokenni olishga urinish
    let token = '';
    try {
      const tokenRes = await fetch(`${AGENT_BASE}/token-info`, { signal: AbortSignal.timeout(2000) });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        token = tokenData.token;
      }
    } catch {}

    // Tizim parametrlarini olish
    let metrics: any = {};
    try {
      const infoRes = await fetch(`${AGENT_BASE}/system-info`, { signal: AbortSignal.timeout(2000) });
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
      error: 'Windows agenti ishga tushmagan (127.0.0.1:8001)'
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

    const res = await fetch(`${AGENT_BASE}/actions/launch`, {
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
