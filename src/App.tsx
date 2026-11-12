import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatModule from './components/ChatModule';
import DocumentModule from './components/DocumentModule';
import CodeEditorModule from './components/CodeEditorModule';
import TaskSchedulerModule from './components/TaskSchedulerModule';
import MultiAgentModule from './components/MultiAgentModule';
import SystemDashboard from './components/SystemDashboard';
import StatusBar from './components/StatusBar';

export type ModuleType = 'chat' | 'document' | 'code' | 'tasks' | 'agents' | 'dashboard';

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('chat');

  const renderModule = () => {
    switch (activeModule) {
      case 'chat':
        return <ChatModule />;
      case 'document':
        return <DocumentModule />;
      case 'code':
        return <CodeEditorModule />;
      case 'tasks':
        return <TaskSchedulerModule />;
      case 'agents':
        return <MultiAgentModule />;
      case 'dashboard':
        return <SystemDashboard />;
      default:
        return <ChatModule />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f1117] text-gray-100">
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

export default App;
