import { MessageSquare, FileText, Code2, Clock, Users, LayoutDashboard, Settings, Bot } from 'lucide-react';
import type { ModuleType } from '../App';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const menuItems: { id: ModuleType; label: string; icon: React.ReactNode }[] = [
  { id: 'chat', label: '智能对话', icon: <MessageSquare size={20} /> },
  { id: 'document', label: '文档处理', icon: <FileText size={20} /> },
  { id: 'code', label: '代码编辑', icon: <Code2 size={20} /> },
  { id: 'tasks', label: '定时任务', icon: <Clock size={20} /> },
  { id: 'agents', label: '多智能体', icon: <Users size={20} /> },
  { id: 'dashboard', label: '系统面板', icon: <LayoutDashboard size={20} /> },
];

export default function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  return (
    <div className="w-64 bg-[#13151c] border-r border-gray-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">LocalAgent</h1>
            <p className="text-xs text-gray-500">本地智能助手 v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              activeModule === item.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* System Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>本地运行中 · 离线模式</span>
        </div>
        <button className="w-full mt-3 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-all">
          <Settings size={18} />
          <span>系统设置</span>
        </button>
      </div>
    </div>
  );
}
