import { createClient } from '@supabase/supabase-js';
import { ChatMessageItem, DrawnStroke } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nlthpwovjcgizsjqllit.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdGhwd292amNnaXpzanFsbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDA0MTIsImV4cCI6MjEwODE3NjQxMn0.HPdNq0QbAkhp8I7OTiqLarMwwzwH588yWt5vz9GKnis';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_SQL_SCHEMA = `-- JARVIS Supabase SQL Schema
-- Ushbu SQL kodini Supabase SQL Editor bo'limida ishga tushiring:

CREATE TABLE IF NOT EXISTS public.jarvis_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL DEFAULT 'default',
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jarvis_drawings (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    strokes JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) ruxsatlari:
ALTER TABLE public.jarvis_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on jarvis_messages" ON public.jarvis_messages;
CREATE POLICY "Allow public all on jarvis_messages" ON public.jarvis_messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.jarvis_drawings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on jarvis_drawings" ON public.jarvis_drawings;
CREATE POLICY "Allow public all on jarvis_drawings" ON public.jarvis_drawings FOR ALL USING (true) WITH CHECK (true);
`;

export async function checkSupabaseConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const start = performance.now();
  try {
    // Auth health ping or session check
    const { error } = await supabase.auth.getSession();
    const latency = Math.round(performance.now() - start);
    if (error) throw error;
    return { connected: true, latencyMs: latency };
  } catch (err: any) {
    return { connected: false, error: err.message || 'Supabase bilan bog\'lanishda xatolik' };
  }
}

export async function saveMessageToSupabase(
  role: 'user' | 'assistant',
  content: string,
  sessionId = 'default'
): Promise<boolean> {
  try {
    const { error } = await supabase.from('jarvis_messages').insert({
      session_id: sessionId,
      role,
      content,
      created_at: new Date().toISOString()
    });
    if (error) {
      console.warn('Supabase jarvis_messages insert ogohlantirish:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert xatosi:', err);
    return false;
  }
}

export async function fetchSupabaseHistory(sessionId = 'default'): Promise<ChatMessageItem[]> {
  try {
    const { data, error } = await supabase
      .from('jarvis_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('id', { ascending: true })
      .limit(50);

    if (error || !data) {
      return [];
    }

    return data.map((item: any) => ({
      id: `cloud-${item.id}`,
      role: item.role,
      content: item.content,
      timestamp: item.created_at || new Date().toISOString()
    }));
  } catch (err) {
    return [];
  }
}

export async function saveDrawingsToSupabase(name: string, strokes: DrawnStroke[]): Promise<boolean> {
  try {
    const { error } = await supabase.from('jarvis_drawings').insert({
      name,
      strokes: JSON.stringify(strokes),
      created_at: new Date().toISOString()
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchDrawingsFromSupabase(): Promise<{ id: number; name: string; strokes: DrawnStroke[] }[]> {
  try {
    const { data, error } = await supabase
      .from('jarvis_drawings')
      .select('*')
      .order('id', { ascending: false })
      .limit(10);

    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      strokes: typeof d.strokes === 'string' ? JSON.parse(d.strokes) : d.strokes
    }));
  } catch {
    return [];
  }
}
