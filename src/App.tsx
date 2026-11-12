import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import ChatModule from './components/ChatModule';
import DocumentModule from './components/DocumentModule';
import CodeEditorModule from './components/CodeEditorModule';
import TaskSchedulerModule from './components/TaskSchedulerModule';
import MultiAgentModule from './components/MultiAgentModule';
import SystemDashboard from './components/SystemDashboard';
import KnowledgeBaseModule from './components/KnowledgeBaseModule';
import StatusBar from './components/StatusBar';

export type ModuleType = 'chat' | 'document' | 'code' | 'tasks' | 'agents' | 'knowledge' | 'dashboard';

function AppContent() {
  const [activeModule, setActiveModule] = useState<ModuleType>('chat');
  const { theme } = useTheme();

  const renderModule = () => {
    switch (activeModule) {
      case 'chat': return <ChatModule />;
      case 'document': return <DocumentModule />;
      case 'code': return <CodeEditorModule />;
      case 'tasks': return <TaskSchedulerModule />;
      case 'agents': return <MultiAgentModule />;
      case 'knowledge': return <KnowledgeBaseModule />;
      case 'dashboard': return <SystemDashboard />;
      default: return <ChatModule />;
    }
  };

  const bgMain = theme === 'dark' ? 'bg-[#0f1117]' : 'bg-[#f5f6fa]';
  const textMain = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${bgMain} ${textMain} transition-colors duration-300`}>
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {renderModule()}
        </div>
        <StatusBar />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
