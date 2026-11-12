import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Bot, User, Sparkles, RotateCcw } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const sampleResponses = [
  "我已经理解了您的需求。让我为您分析一下这个问题...\n\n根据您的描述，我建议从以下几个方面入手：\n1. 首先确认数据格式是否正确\n2. 检查处理流程中的每个环节\n3. 验证输出结果是否符合预期\n\n需要我进一步详细说明吗？",
  "好的，我来帮您处理这个任务。根据我的分析：\n\n**处理步骤：**\n- 步骤一：数据预处理\n- 步骤二：特征提取\n- 步骤三：模型推理\n- 步骤四：结果后处理\n\n整个过程预计在本地环境下约需30秒完成。",
  "这是一个很好的问题！让我为您详细解答：\n\n在本地部署环境中，我们可以利用以下技术栈：\n- 推理引擎：llama.cpp / ONNX Runtime\n- 文档解析：Apache Tika\n- 任务调度：内置Cron模块\n\n所有组件均已优化适配您的硬件配置（i5-13400 + 16GB RAM）。",
];

export default function ChatModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: '您好！我是 LocalAgent 智能助手。我完全运行在您的本地设备上，无需联网即可使用。\n\n我可以帮您：\n• 📄 处理PDF/Word/Excel文档\n• 💻 编写和调试代码\n• ⏰ 管理定时任务\n• 🤖 协调多智能体协作\n\n请问有什么可以帮您的？',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">智能对话</h2>
            <p className="text-xs text-gray-500">本地大语言模型 · Qwen2.5-7B-Q4</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="新对话">
            <RotateCcw size={16} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-xs text-green-400">模型就绪</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : 'bg-gradient-to-br from-gray-600 to-gray-700'
            }`}>
              {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
            </div>
            <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-[#1e2030] border border-gray-700/50 text-gray-200'
                  : 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
              <span className="text-xs text-gray-600 mt-1 block">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-[#1e2030] border border-gray-700/50 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-400 animate-pulse" />
                <span className="text-sm text-gray-400">思考中...</span>
                <div className="flex gap-1 ml-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-[#1e2030] border border-gray-700 rounded-xl p-3 focus-within:border-blue-500/50 transition-colors">
            <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Paperclip size={18} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息... (Shift+Enter 换行)"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none max-h-32 min-h-[24px]"
              rows={1}
            />
            <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Mic size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            本地推理 · 数据不离开您的设备 · 模型: Qwen2.5-7B-Q4_K_M
          </p>
        </div>
      </div>
    </div>
  );
}
