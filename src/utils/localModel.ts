export type LocalModelConfig = { baseUrl: string; model: string };

declare global {
  interface Window {
    localAgentDesktop?: {
      isDesktop: true;
      listModels: (config: LocalModelConfig) => Promise<string[]>;
      chat: (config: LocalModelConfig, messages: Array<{ role: string; content: string }>) => Promise<string>;
      saveText: (suggestedName: string, content: string) => Promise<boolean>;
    };
  }
}

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
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname.toLowerCase())) {
    throw new Error('为保持离线，模型地址必须是 localhost / 127.0.0.1 / ::1。');
  }
  url.pathname = `${url.pathname.replace(/\/$/, '')}${path}`;
  url.search = ''; url.hash = '';
  return url.toString();
}

export async function checkLocalModel(config: LocalModelConfig): Promise<string[]> {
  if (window.localAgentDesktop?.isDesktop) return window.localAgentDesktop.listModels(config);
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
  if (window.localAgentDesktop?.isDesktop) return window.localAgentDesktop.chat(config, messages);
  const models = await checkLocalModel(config);
  const model = config.model || models[0];
  if (!model) throw new Error('本地模型服务未列出可用模型，请先在 LM Studio 加载模型。');
  const response = await fetch(localEndpoint(config.baseUrl, '/chat/completions'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.4, stream: false }), signal,
  });
  if (!response.ok) throw new Error(`模型推理失败：HTTP ${response.status} ${await response.text()}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('模型返回了空内容。');
  return content;
}
