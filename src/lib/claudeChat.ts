// The user's Anthropic API key lives ONLY in this device's localStorage. It is
// never bundled, committed, or sent anywhere except directly to api.anthropic.com.
//
// The @anthropic-ai/sdk is imported DYNAMICALLY inside streamCoach() so it is
// code-split into its own chunk — it never weighs down the initial app load,
// only downloading the first time you actually chat with the coach.
const KEY = 'liftoff_anthropic_key';
const MODEL_KEY = 'liftoff_coach_model';

export const COACH_MODELS = [
  { id: 'claude-opus-4-8', label: 'Opus 4.8 — most capable' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — faster, cheaper' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 — fastest, cheapest' },
];
const DEFAULT_MODEL = 'claude-opus-4-8';

export const getKey = () => localStorage.getItem(KEY) || '';
export const hasKey = () => getKey().trim().length > 0;
export const setKey = (k: string) => {
  if (k.trim()) localStorage.setItem(KEY, k.trim());
  else localStorage.removeItem(KEY);
};
export const getModel = () => localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL;
export const setModel = (m: string) => localStorage.setItem(MODEL_KEY, m);

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

function friendlyError(e: unknown): string {
  const status = (e as { status?: number })?.status;
  if (status === 401) return 'Your API key was rejected. Check it in Settings.';
  if (status === 403) return 'This key lacks access to the selected model.';
  if (status === 429) return 'Rate limited — wait a moment and try again.';
  if (e instanceof Error) return e.message;
  return 'Something went wrong talking to Claude.';
}

// Streams a coach reply, calling onText with each delta. Returns the full text.
export async function streamCoach(opts: {
  system: string;
  messages: ChatMsg[];
  onText: (delta: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const apiKey = getKey();
  if (!apiKey) throw new Error('Connect your Anthropic API key in Settings first.');

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const stream = client.messages.stream(
      {
        model: getModel(),
        max_tokens: 2048,
        system: opts.system,
        messages: opts.messages,
      },
      { signal: opts.signal },
    );
    stream.on('text', (delta) => opts.onText(delta));
    const final = await stream.finalMessage();
    return final.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('');
  } catch (e) {
    throw new Error(friendlyError(e), { cause: e });
  }
}
