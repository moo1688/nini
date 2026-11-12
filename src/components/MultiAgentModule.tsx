import { useState } from 'react';
import { Users, Plus, Settings, Play, Pause, Zap, MessageSquare, GitBranch, ArrowRight } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  role: string;
  model: string;
  status: 'idle' | 'working' | 'waiting' | 'error';
  tasks: number;
  description: string;
  icon: string;
}

interface Workflow {
  id: number;
  name: string;
  agents: string[];
  status: 'active' | 'idle';
  description: string;
}

const agents: Agent[] = [
  { id: 1, name: '主协调Agent', role: '协调者', model: 'Qwen2.5-7B', status: 'working', tasks: 12, description: '负责任务分配与结果汇总', icon: '🧠' },
  { id: 2, name: '文档分析Agent', role: '专家', model: 'Qwen2.5-7B', status: 'idle', tasks: 8, description: '专门处理文档解析与分析', icon: '📄' },
  { id: 3, name: '代码助手Agent', role: '专家', model: 'CodeQwen-7B', status: 'working', tasks: 15, description: '代码生成、审查与调试', icon: '💻' },
  { id: 4, name: '数据处理Agent', role: '专家', model: 'Qwen2.5-7B', status: 'idle', tasks: 6, description: '数据清洗、转换与分析', icon: '📊' },
  { id: 5, name: '翻译Agent', role: '专家', model: 'Qwen2.5-7B', status: 'waiting', tasks: 4, description: '多语言翻译与本地化', icon: '🌐' },
  { id: 6, name: '摘要Agent', role: '专家', model: 'Qwen2.5-3B', status: 'idle', tasks: 20, description: '文本摘要与关键信息提取', icon: '📝' },
];

const workflows: Workflow[] = [
  { id: 1, name: '文档处理流水线', agents: ['主协调Agent', '文档分析Agent', '摘要Agent'], status: 'active', description: '自动解析文档并生成摘要报告' },
  { id: 2, name: '代码审查流程', agents: ['主协调Agent', '代码助手Agent'], status: 'idle', description: '代码生成后自动审查与优化' },
  { id: 3, name: '数据分析管线', agents: ['主协调Agent', '数据处理Agent', '摘要Agent'], status: 'active', description: '数据处理→分析→报告生成' },
];

export default function MultiAgentModule() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeView, setActiveView] = useState<'agents' | 'workflows'>('agents');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'working': return 'bg-green-500 animate-pulse';
      case 'waiting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'idle': return '空闲';
      case 'working': return '工作中';
      case 'waiting': return '等待中';
      case 'error': return '异常';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Users size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">多智能体协作</h2>
            <p className="text-xs text-gray-500">多Agent协同工作流管理</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#1e2030] rounded-lg border border-gray-700 p-0.5">
            <button
              onClick={() => setActiveView('agents')}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${activeView === 'agents' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              智能体
            </button>
            <button
              onClick={() => setActiveView('workflows')}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${activeView === 'workflows' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              工作流
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors">
            <Plus size={16} />
            <span>新建Agent</span>
          </button>
        </div>
      </div>

      {activeView === 'agents' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Agent Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`bg-[#1e2030] border rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500/30 ${
                    selectedAgent?.id === agent.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium text-white">{agent.name}</h4>
                        <p className="text-xs text-gray-500">{agent.role} · {agent.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                      <span className="text-xs text-gray-400">{getStatusLabel(agent.status)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">{agent.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                    <span className="text-xs text-gray-500">已完成: {agent.tasks} 个任务</span>
                    <div className="flex gap-1">
                      <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                        <Play size={12} />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                        <Settings size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Detail */}
          {selectedAgent && (
            <div className="w-80 border-l border-gray-800 p-4 overflow-y-auto">
              <div className="text-center mb-4">
                <span className="text-4xl">{selectedAgent.icon}</span>
                <h3 className="text-base font-semibold text-white mt-2">{selectedAgent.name}</h3>
                <p className="text-xs text-gray-500">{selectedAgent.role} · {selectedAgent.model}</p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-[#0f1117] rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">状态</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedAgent.status)}`}></div>
                    <span className="text-sm text-white">{getStatusLabel(selectedAgent.status)}</span>
                  </div>
                </div>
                
                <div className="bg-[#0f1117] rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">描述</p>
                  <p className="text-sm text-white">{selectedAgent.description}</p>
                </div>

                <div className="bg-[#0f1117] rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">统计</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-400">{selectedAgent.tasks}</p>
                      <p className="text-xs text-gray-500">完成任务</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-400">98%</p>
                      <p className="text-xs text-gray-500">成功率</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f1117] rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">最近活动</p>
                  <div className="space-y-2">
                    {['处理文档摘要请求', '完成代码审查任务', '执行数据分析'].map((activity, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-gray-300">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white transition-colors">
                    <MessageSquare size={12} />
                    <span>发送指令</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white transition-colors">
                    <Zap size={12} />
                    <span>立即执行</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Workflows View */
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-[#1e2030] border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{workflow.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        workflow.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {workflow.status === 'active' ? '运行中' : '空闲'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{workflow.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                      {workflow.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Workflow Pipeline */}
                <div className="flex items-center gap-2 flex-wrap">
                  {workflow.agents.map((agentName, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#0f1117] rounded-lg border border-gray-700">
                        <span className="text-sm">{agents.find(a => a.name === agentName)?.icon || '🤖'}</span>
                        <span className="text-xs text-white">{agentName}</span>
                      </div>
                      {idx < workflow.agents.length - 1 && (
                        <ArrowRight size={14} className="text-gray-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Create New Workflow */}
            <button className="w-full p-4 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-blue-500/30 hover:text-blue-400 transition-colors">
              <Plus size={16} />
              <span className="text-sm">创建新工作流</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
