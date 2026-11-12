import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Bot, FileText, MessageSquare, Paperclip, Send, Settings, Upload, BookOpen, Trash2, Download, RefreshCw, Search, Moon, Sun } from 'lucide-react';
import { askLocalModel, checkLocalModel, loadModelConfig, saveModelConfig, type LocalModelConfig } from './utils/localModel';
import { readRecord, writeRecord } from './utils/localStore';
import { cleanDocumentText, parseDocument, searchKnowledge, type KnowledgeHit } from './utils/documentParser';
import { useTheme } from './context/ThemeContext';

type View = 'chat' | 'documents' | 'knowledge' | 'settings';
type Doc = { id: string; name: string; type: string; text: string; size: number; addedAt: number; warnings: string[] };
type Msg = { id: string; role: 'user' | 'assistant'; content: string; files?: string[] };
const ACCEPT = '.txt,.md,.csv,.json,.log,.html,.htm,.xml,.pdf,.docx,.xlsx,.doc,.xls';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const [view, setView] = useState<View>('chat');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState('');
  const [prompt, setPrompt] = useState('');
  const [pending, setPending] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('尚未连接本地模型');
  const [config, setConfig] = useState<LocalModelConfig>(loadModelConfig);
  const [modelList, setModelList] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [knowledgeHits, setKnowledgeHits] = useState<KnowledgeHit[]>([]);
  const picker = useRef<HTMLInputElement>(null);
  const { theme, themeMode, setThemeMode } = useTheme();
  const isDark = theme === 'dark';
  const page = isDark ? 'bg-[#0f1117] text-gray-100' : 'bg-slate-50 text-slate-900';
  const panel = isDark ? 'bg-[#171a23] border-gray-700/70' : 'bg-white border-slate-200';
  const inputStyle = isDark ? 'bg-[#10131b] border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';
  const shownDocs = useMemo(() => docs.filter(d => d.name.toLowerCase().includes(query.toLowerCase())), [docs, query]);

  // Hydrate before writing so the initial empty React state cannot overwrite the user's local database.
  useEffect(() => {
    let alive = true;
    Promise.all([readRecord<Doc[]>('documents', []), readRecord<Msg[]>('messages', [])]).then(([savedDocs, savedMessages]) => {
      if (alive) { setDocs(savedDocs); setMessages(savedMessages); setReady(true); }
    }).catch(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { if (ready) void writeRecord('documents', docs).catch(() => setNotice('本地文档存储失败，可能是浏览器空间不足。')); }, [docs, ready]);
  useEffect(() => { if (ready) void writeRecord('messages', messages).catch(() => setNotice('本地会话保存失败。')); }, [messages, ready]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 6500); return () => clearTimeout(timer); }, [notice]);

  async function uploadFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    if (!incoming.length) return;
    const accepted: Doc[] = [];
    const warnings: string[] = [];
    for (const file of incoming) {
      if (file.size > MAX_FILE_BYTES) { warnings.push(`${file.name} 超过 20 MB，已跳过。`); continue; }
      try {
        const parsed = await parseDocument(file);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        accepted.push({ id: makeId(), name: file.name, type: extension, text: parsed.text, size: file.size, addedAt: Date.now(), warnings: parsed.warnings });
        warnings.push(...parsed.warnings);
      } catch (error) { warnings.push(`${file.name}：${error instanceof Error ? error.message : '解析失败'}`); }
    }
    setDocs(old => [...accepted, ...old]);
    if (accepted.length) setNotice(`已导入 ${accepted.length} 个文件；提取正文 ${accepted.filter(doc => doc.text).length} 个。${warnings.length ? ` ${warnings.join(' ')}` : ''}`);
    else if (warnings.length) setNotice(warnings.join(' '));
  }

  async function readPending(file: File): Promise<string> {
    if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} 超过 20 MB 附件上限。`);
    return (await parseDocument(file)).text;
  }

  async function send() {
    const question = input.trim();
    if ((!question && !pending.length) || busy) return;
    const fileNames = pending.map(file => file.name);
    const contextParts: string[] = [];
    for (const file of pending) {
      const text = await readPending(file);
      if (text) contextParts.push(`[附件 ${file.name}]\n${text.slice(0, 10000)}`);
    }
    const hits = searchKnowledge(docs, question, 4);
    setKnowledgeHits(hits);
    if (hits.length) contextParts.push(`[本地知识库检索结果]\n${hits.map(hit => `[${hit.name}]\n${hit.excerpt}`).join('\n\n---\n\n')}`);
    const userContent = `${question || '请阅读我上传的附件并概述其内容。'}${contextParts.length ? `\n\n${contextParts.join('\n\n')}` : ''}`;
    const next: Msg = { id: makeId(), role: 'user', content: question || '请阅读附件并概述。', files: fileNames };
    setMessages(old => [...old, next]); setInput(''); setPending([]); setBusy(true); setStatus('本地模型推理中…');
    try {
      const answer = await askLocalModel(config, [
        { role: 'system', content: '你是本地中文办公助手。仅使用用户消息和提供的本地知识库摘录；如信息不足请说明。引用知识库时注明来源文件名。不要声称已执行未执行的操作。' },
        ...messages.slice(-10).map(message => ({ role: message.role, content: message.content })),
        { role: 'user', content: userContent },
      ]);
      setMessages(old => [...old, { id: makeId(), role: 'assistant', content: answer }]); setStatus('本地模型已连接');
    } catch (error) { setStatus('模型未连接'); setNotice(error instanceof Error ? error.message : '本地模型调用失败'); }
    finally { setBusy(false); }
  }

  async function generateDocument() {
    if (!prompt.trim()) { setNotice('请先输入文档生成提示词。'); return; }
    if (busy) return;
    setBusy(true);
    try {
      const hits = searchKnowledge(docs, prompt, 6);
      const material = hits.map(hit => `[${hit.name}]\n${hit.excerpt}`).join('\n\n---\n\n');
      const result = await askLocalModel(config, [
        { role: 'system', content: '你是办公文档撰写助手。生成结构清晰、事实审慎的中文文档正文；不要虚构用户未提供的数据。若给出参考材料，优先使用并标注材料来源。' },
        { role: 'user', content: `${prompt.trim()}${material ? `\n\n参考知识库材料：\n${material}` : ''}` },
      ]);
      const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `文档草稿-${new Date().toISOString().slice(0, 10)}.md`; link.click(); URL.revokeObjectURL(link.href);
      setNotice('文档草稿已生成并下载为 Markdown。');
    } catch (error) { setNotice(error instanceof Error ? error.message : '生成失败'); }
    finally { setBusy(false); }
  }

  async function testModel() {
    setStatus('正在检查本地服务…');
    try { const list = await checkLocalModel(config); setModelList(list); setStatus(`本地模型服务正常（${list.length} 个模型）`); setNotice(list.length ? `检测到模型：${list.join(', ')}` : '服务可用，但没有加载模型。'); }
    catch (error) { setStatus('模型未连接'); setNotice(error instanceof Error ? error.message : '连接失败'); }
  }

  function downloadText(doc: Doc) {
    const blob = new Blob([doc.text || `该 ${doc.type.toUpperCase()} 文件仅登记了元数据，正文未能提取。`], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${doc.name}.txt`; a.click(); URL.revokeObjectURL(a.href);
  }
  function exportKnowledge() {
    const payload = JSON.stringify(docs, null, 2);
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json;charset=utf-8' })); link.download = 'localagent-knowledge.json'; link.click(); URL.revokeObjectURL(link.href);
  }
  async function importKnowledge(file: File) {
    try {
      const parsed = await parseDocument(file);
      if (file.name.toLowerCase().endsWith('.json')) {
        const data = JSON.parse(await file.text());
        const imported = Array.isArray(data) ? data.filter(item => item && typeof item.name === 'string' && typeof item.text === 'string').map(item => ({ id: makeId(), name: cleanDocumentText(item.name), type: 'txt', text: cleanDocumentText(item.text), size: item.size || item.text.length, addedAt: Date.now(), warnings: [] })) : [];
        setDocs(old => [...imported, ...old]); setNotice(`已导入 ${imported.length} 条知识库记录。`); return;
      }
      setDocs(old => [{ id: makeId(), name: file.name, type: file.name.split('.').pop() || 'txt', text: parsed.text, size: file.size, addedAt: Date.now(), warnings: parsed.warnings }, ...old]);
      setNotice(parsed.warnings.join(' ') || '知识已导入并完成文本清洗。');
    } catch (error) { setNotice(error instanceof Error ? error.message : '知识库导入失败'); }
  }

  const button = `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:opacity-80 ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-slate-200 text-slate-800'}`;
  const navItems: { id: View; label: string; icon: typeof Bot }[] = [
    { id: 'chat', label: '智能对话', icon: MessageSquare }, { id: 'documents', label: '文档中心', icon: FileText }, { id: 'knowledge', label: '个人知识库', icon: BookOpen }, { id: 'settings', label: '设置与模型', icon: Settings },
  ];

  return <div className={`flex min-h-screen ${page}`}>
    <aside className={`flex w-60 shrink-0 flex-col border-r p-4 ${isDark ? 'border-gray-800 bg-[#13151c]' : 'border-slate-200 bg-white'}`}>
      <h1 className="mb-1 text-lg font-bold">LocalAgent</h1><p className="mb-6 text-xs opacity-60">离线办公助手 · 浏览器本地数据</p>
      <nav className="space-y-1">{navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${view === id ? 'bg-blue-600 text-white' : 'opacity-75 hover:bg-blue-500/10'}`}><Icon size={17}/>{label}</button>)}</nav>
      <div className="mt-auto border-t border-current/10 pt-4"><div className="flex items-center gap-2 text-xs"><Activity size={14}/><span>{status}</span></div><p className="mt-2 text-[11px] opacity-50">模型请求仅访问 localhost</p></div>
    </aside>
    <main className="min-w-0 flex-1 p-5 md:p-8">
      {notice && <div role="status" className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm">{notice}<button className="float-right" onClick={() => setNotice('')}>关闭</button></div>}
      {view === 'chat' && <section className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <header className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-semibold">智能对话</h2><p className="text-sm opacity-60">本地模型问答，可附加文本并引用知识库</p></div><button className={button} onClick={() => setMessages([])}>新对话</button></header>
        <div className={`flex-1 space-y-4 overflow-auto rounded-xl border p-4 ${panel}`}>
          {!messages.length && <div className="py-16 text-center opacity-60"><Bot className="mx-auto mb-3"/><p>配置本地 OpenAI 兼容模型后开始对话</p><p className="mt-1 text-xs">默认兼容 LM Studio：127.0.0.1:1234/v1</p></div>}
          {messages.map(message => <article key={message.id} className={`max-w-[85%] whitespace-pre-wrap rounded-xl p-3 ${message.role === 'user' ? 'ml-auto bg-blue-600 text-white' : isDark ? 'bg-[#252a36]' : 'bg-slate-100'}`}><div className="mb-1 flex flex-wrap items-center gap-2 text-xs opacity-60">{message.role === 'user' ? '你' : '本地助手'}{message.files?.map(file => <span key={file}>📎 {file}</span>)}</div>{message.content}</article>)}
          {busy && <p className="animate-pulse text-sm opacity-60">本地模型处理中…</p>}
        </div>
        {knowledgeHits.length > 0 && <p className="mt-2 text-xs opacity-60">本次检索到：{knowledgeHits.map(hit => hit.name).join('、')}</p>}
        {pending.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{pending.map((f, i) => <button key={`${f.name}-${i}`} onClick={() => setPending(old => old.filter((_, n) => n !== i))} className={button}>📎 {f.name} ×</button>)}</div>}
        <div className={`mt-3 flex items-end gap-2 rounded-xl border p-3 ${panel}`}><input ref={picker} type="file" multiple accept={ACCEPT} hidden onChange={e => { if (e.target.files) setPending(old => [...old, ...Array.from(e.target.files!)]); e.currentTarget.value = ''; }}/><button title="添加附件" className={button} onClick={() => picker.current?.click()}><Paperclip size={17}/></button><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="输入消息… Enter 发送，Shift+Enter 换行" className="max-h-40 min-h-10 flex-1 resize-y rounded bg-transparent p-2 text-sm outline-none"/><button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50" onClick={() => void send()}><Send size={17}/></button></div>
      </section>}
      {view === 'documents' && <section className="mx-auto max-w-5xl"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">文档中心</h2><p className="text-sm opacity-60">文本、CSV、JSON、HTML/XML 可本地解析；PDF/Office 未解析会明确告知</p></div><button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={() => picker.current?.click()}><Upload size={16}/>上传文档</button></div>
        <input ref={picker} type="file" multiple accept={ACCEPT} hidden onChange={e => { if (e.target.files) void uploadFiles(e.target.files); e.currentTarget.value = ''; }}/>
        <div className={`mb-4 grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_auto] ${panel}`}><textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className={`rounded-lg border p-3 text-sm ${inputStyle}`} placeholder="文档生成提示词：基于本地知识库生成周报、会议纪要、方案等；请说明结构、受众和语气。"/><button disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50" onClick={() => void generateDocument()}>生成并下载 .md</button></div>
        <input value={query} onChange={e => setQuery(e.target.value)} className={`mb-3 w-full rounded-lg border p-2 ${inputStyle}`} placeholder="搜索文档名称…"/>
        <div className="space-y-2">{shownDocs.map(doc => <article key={doc.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${panel}`}><div className="min-w-0"><h3 className="font-medium">{doc.name}</h3><p className="text-xs opacity-60">{doc.type.toUpperCase()} · {(doc.size / 1024).toFixed(1)} KB · {doc.text ? `${doc.text.length} 字符已提取` : '正文未提取'}</p>{doc.warnings.map(warning => <p key={warning} className="mt-1 text-xs text-amber-500">{warning}</p>)}{doc.text && <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm opacity-75">{doc.text.slice(0, 240)}</p>}</div><div className="flex gap-2"><button className={button} onClick={() => downloadText(doc)}><Download size={15}/></button><button className={button} onClick={() => setDocs(old => old.filter(item => item.id !== doc.id))}><Trash2 size={15}/></button></div></article>)}{!shownDocs.length && <p className="py-10 text-center opacity-50">暂无文档，请上传支持的文件。</p>}</div>
      </section>}
      {view === 'knowledge' && <section className="mx-auto max-w-5xl"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="mb-2 text-xl font-semibold">个人知识库</h2><p className="text-sm opacity-60">清洗后的文本保存在浏览器 IndexedDB；分块关键词检索仅本机运行。</p></div><div className="flex gap-2"><label className={`${button} cursor-pointer`}>导入知识<input type="file" accept=".json,.txt,.md,.csv,.log" hidden onChange={e => { const file = e.target.files?.[0]; if (file) void importKnowledge(file); e.currentTarget.value = ''; }}/></label><button className={button} onClick={exportKnowledge}><Download size={15}/>导出备份</button></div></div><div className={`mb-4 rounded-xl border p-4 ${panel}`}><p className="text-sm">已登记 {docs.length} 个文件 · 可检索文本 {docs.filter(doc => doc.text).length} 个</p><input value={query} onChange={e => setQuery(e.target.value)} className={`mt-3 w-full rounded-lg border p-2 ${inputStyle}`} placeholder="按文件名筛选知识…"/><button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={() => setView('documents')}>导入/管理文档</button></div>{shownDocs.filter(doc => doc.text).map(doc => <article key={doc.id} className={`mb-2 rounded-xl border p-4 ${panel}`}><div className="flex justify-between gap-3"><b>{doc.name}</b><button title="删除" onClick={() => setDocs(old => old.filter(item => item.id !== doc.id))}><Trash2 size={15}/></button></div><pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap text-xs opacity-70">{doc.text.slice(0, 1200)}</pre></article>)}</section>}
      {view === 'settings' && <section className="mx-auto max-w-3xl"><h2 className="mb-5 text-xl font-semibold">设置与本地模型</h2><div className={`space-y-4 rounded-xl border p-5 ${panel}`}><div><label className="mb-1 block text-sm">OpenAI 兼容本地服务地址（仅允许本机）</label><input value={config.baseUrl} onChange={e => setConfig(old => ({ ...old, baseUrl: e.target.value }))} className={`w-full rounded-lg border p-2 ${inputStyle}`} placeholder="http://127.0.0.1:1234/v1"/></div><div><label className="mb-1 block text-sm">模型 ID（可留空自动选择）</label><input value={config.model} onChange={e => setConfig(old => ({ ...old, model: e.target.value }))} list="local-models" className={`w-full rounded-lg border p-2 ${inputStyle}`} placeholder="LM Studio 加载的模型 ID"/><datalist id="local-models">{modelList.map(model => <option key={model} value={model}/>)}</datalist></div><p className="text-xs opacity-60">建议 LM Studio 加载适合内存的 GGUF Q4 模型并开启本地 API。浏览器需允许 localhost 请求。本应用代码不调用云端模型。</p><div className="flex flex-wrap gap-2"><button className={button} onClick={() => { saveModelConfig(config); setNotice('模型配置已保存在本机浏览器。'); }}>保存配置</button><button className={button} onClick={() => { saveModelConfig(config); void testModel(); }}><RefreshCw size={15}/>检测本地服务</button></div>{modelList.length > 0 && <p className="text-sm">发现模型：{modelList.join(', ')}</p>}<hr className="border-current/10"/><label className="block text-sm">外观模式</label><select value={themeMode} onChange={e => setThemeMode(e.target.value as 'dark' | 'light' | 'auto')} className={`rounded-lg border p-2 ${inputStyle}`}><option value="dark">深色</option><option value="light">浅色</option><option value="auto">跟随系统外观</option></select><p className="text-xs opacity-60">自动模式跟随 Windows/浏览器系统颜色偏好。</p><button className={button} onClick={() => setThemeMode(isDark ? 'light' : 'dark')}>{isDark ? <Sun size={15}/> : <Moon size={15}/>}切换主题</button></div></section>}
      <footer className="mx-auto mt-8 max-w-5xl border-t border-current/10 pt-3 text-xs opacity-45">本地优先 · 浏览器存储 · PDF/Office 正文解析器和 Windows 桌面后台能力尚未集成</footer>
    </main>
  </div>;
}
