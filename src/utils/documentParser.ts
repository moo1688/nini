export type ParsedDocument = { text: string; warnings: string[] };

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'csv', 'json', 'log', 'html', 'htm', 'xml']);

export function cleanDocumentText(input: string): string {
  return input
    .replace(/^\uFEFF/, '')
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function csvToReadableText(input: string): string {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '"' && quoted && input[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  row.push(cell);
  if (row.some(value => value.length > 0)) rows.push(row);
  return rows.map(values => values.join(' | ')).join('\n');
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  if (file.size > MAX_FILE_BYTES) throw new Error(`文件超过 20 MB 限制：${file.name}`);
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!TEXT_EXTENSIONS.has(extension)) {
    return {
      text: '',
      warnings: [`${extension.toUpperCase()} 文件已登记，但浏览器版尚未集成该格式的正文解析器；没有把附件误报为已解析。`],
    };
  }
  const raw = await file.text();
  if (extension === 'json') {
    try { return { text: cleanDocumentText(JSON.stringify(JSON.parse(raw), null, 2)), warnings: [] }; }
    catch { return { text: cleanDocumentText(raw), warnings: ['JSON 格式校验失败，已按纯文本保存。'] }; }
  }
  if (extension === 'csv') return { text: cleanDocumentText(csvToReadableText(raw)), warnings: [] };
  if (extension === 'html' || extension === 'htm') {
    const parsed = new DOMParser().parseFromString(raw, 'text/html');
    parsed.querySelectorAll('script,style,noscript,svg').forEach(node => node.remove());
    return { text: cleanDocumentText(parsed.body.textContent || ''), warnings: [] };
  }
  if (extension === 'xml') {
    const parsed = new DOMParser().parseFromString(raw, 'application/xml');
    if (parsed.querySelector('parsererror')) return { text: cleanDocumentText(raw), warnings: ['XML 格式校验失败，已按纯文本保存。'] };
    return { text: cleanDocumentText(parsed.documentElement.textContent || ''), warnings: [] };
  }
  return { text: cleanDocumentText(raw), warnings: [] };
}

export function chunkText(text: string, chunkSize = 700, overlap = 100): string[] {
  const normalized = cleanDocumentText(text);
  if (!normalized) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);
    if (end < normalized.length) {
      const paragraphBoundary = normalized.lastIndexOf('\n', end);
      if (paragraphBoundary > start + chunkSize * 0.6) end = paragraphBoundary;
    }
    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= normalized.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

function terms(text: string): Set<string> {
  const normalized = text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const result = new Set(normalized.split(/\s+/).filter(term => term.length > 1));
  // Add character bigrams so Chinese queries without spaces can match locally.
  const compact = normalized.replace(/\s/g, '');
  for (let i = 0; i + 1 < compact.length; i += 1) result.add(compact.slice(i, i + 2));
  return result;
}

export type KnowledgeSource = { id: string; name: string; text: string; addedAt: number };
export type KnowledgeHit = { id: string; name: string; addedAt: number; excerpt: string; score: number };

export function searchKnowledge(sources: KnowledgeSource[], query: string, limit = 4): KnowledgeHit[] {
  const queryTerms = terms(query);
  if (!queryTerms.size) return [];
  const hits: KnowledgeHit[] = [];
  for (const source of sources) {
    if (!source.text) continue;
    for (const chunk of chunkText(source.text)) {
      const chunkTerms = terms(chunk);
      let score = 0;
      for (const term of queryTerms) if (chunkTerms.has(term)) score += term.length > 2 ? 2 : 1;
      if (score > 0) hits.push({ id: source.id, name: source.name, addedAt: source.addedAt, excerpt: chunk.slice(0, 1000), score });
    }
  }
  return hits.sort((a, b) => b.score - a.score || b.addedAt - a.addedAt).slice(0, limit);
}
