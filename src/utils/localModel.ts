export interface LocalModelConfig { baseUrl: string; model: string; }

const DEFAULT_URL = 'http://127.0.0.1:1234/v1';

export function loadModelConfig(): LocalModelConfig {
  try {
    const value = JSON.parse(localStorage.getItem('localagent-model') || '{}');
    return { baseUrl: value.baseUrl || DEFAULT_URL, model: value.model || '' };
  } catch { return { baseUrl: DEFAULT_URL, model: '' }; }
}

export function saveModelConfig(config: LocalModelConfig): void {
  localStorage.setItem('localagent-model', JSON.stringify(config));
}

function localEndpoint(baseUrl: string, path: string): string {
  const url = new URL(baseUrl);
  const host = url.hostname.toLowerCase();
  if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
    throw new Error('为保持离线，模型地址必须是 localhost / 127.0.0.1。');
  }
  return `${url.toString().replace(/\/$/, '')}${path}`;
}

export async function checkLocalModel(config: LocalModelConfig): Promise<string[]> {
  const response = await fetch(localEndpoint(config.baseUrl, '/models'), { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`本地模型服务返回 HTTP ${response.status}`);
  const data = await response.json();
  return Array.isArray(data.data) ? data.data.map((item: { id?: string }) => item.id).filter(Boolean) : [];
}

export async function askLocalModel(
  config: LocalModelConfig,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  signal?: AbortSignal,
): Promise<string> {
  const models = await checkLocalModel(config);
  const model = config.model || models[0];
  if (!model) throw new Error('本地模型服务未列出可用模型，请先在 LM Studio 加载模型。');
  const response = await fetch(localEndpoint(config.baseUrl, '/chat/completions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.4, stream: false }),
    signal,
  });
  if (!response.ok) throw new Error(`模型推理失败：HTTP ${response.status} ${await response.text()}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('模型返回了空内容。');
  return content;
}
