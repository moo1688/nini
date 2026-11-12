import { useState } from 'react';
import { Clock, Play, Pause, Plus, Trash2, Edit3, Calendar, Repeat, CheckCircle2, AlertCircle } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  description: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  type: 'script' | 'backup' | 'report' | 'cleanup' | 'sync';
}

const sampleTasks: Task[] = [
  {
    id: 1,
    name: '每日数据备份',
    description: '自动备份工作目录到本地备份盘',
    schedule: '每天 02:00',
    nextRun: '2024-12-16 02:00',
    lastRun: '2024-12-15 02:00',
    status: 'active',
    type: 'backup',
  },
  {
    id: 2,
    name: '周报自动生成',
    description: '汇总本周工作数据并生成报告',
    schedule: '每周五 17:00',
    nextRun: '2024-12-20 17:00',
    lastRun: '2024-12-13 17:00',
    status: 'active',
    type: 'report',
  },
  {
    id: 3,
    name: '临时文件清理',
    description: '清理超过7天的临时文件',
    schedule: '每天 06:00',
    nextRun: '2024-12-16 06:00',
    lastRun: '2024-12-15 06:00',
    status: 'active',
    type: 'cleanup',
  },
  {
    id: 4,
    name: '文档索引更新',
    description: '重新索引本地文档库',
    schedule: '每小时',
    nextRun: '2024-12-15 15:00',
    lastRun: '2024-12-15 14:00',
    status: 'paused',
    type: 'sync',
  },
  {
    id: 5,
    name: '系统健康检查',
    description: '检查磁盘空间和内存使用情况',
    schedule: '每6小时',
    nextRun: '2024-12-15 18:00',
    lastRun: '2024-12-15 12:00',
    status: 'completed',
    type: 'script',
  },
  {
    id: 6,
    name: '日志归档',
    description: '归档超过30天的系统日志',
    schedule: '每月1日 03:00',
    nextRun: '2025-01-01 03:00',
    lastRun: '2024-12-01 03:00',
    status: 'error',
    type: 'cleanup',
  },
];

export default function TaskSchedulerModule() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'active' ? 'paused' : 'active' } : t
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 size={14} className="text-green-400" />;
      case 'paused': return <Pause size={14} className="text-yellow-400" />;
      case 'completed': return <CheckCircle2 size={14} className="text-blue-400" />;
      case 'error': return <AlertCircle size={14} className="text-red-400" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '运行中';
      case 'paused': return '已暂停';
      case 'completed': return '已完成';
      case 'error': return '出错';
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'backup': return '💾';
      case 'report': return '📊';
      case 'cleanup': return '🧹';
      case 'sync': return '🔄';
      case 'script': return '⚙️';
      default: return '📋';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Clock size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">定时任务</h2>
            <p className="text-xs text-gray-500">自动化任务调度与管理</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors"
        >
          <Plus size={16} />
          <span>新建任务</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-800">
        {[
          { label: '活跃任务', value: tasks.filter(t => t.status === 'active').length, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: '已暂停', value: tasks.filter(t => t.status === 'paused').length, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: '今日已完成', value: tasks.filter(t => t.status === 'completed').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: '异常任务', value: tasks.filter(t => t.status === 'error').length, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-800`}>
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="mx-6 mt-4 p-4 bg-[#1e2030] border border-blue-500/30 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-3">新建定时任务</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">任务名称</label>
              <input className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500/50" placeholder="输入任务名称" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">任务类型</label>
              <select className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500/50">
                <option>脚本执行</option>
                <option>数据备份</option>
                <option>报告生成</option>
                <option>文件清理</option>
                <option>数据同步</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">执行周期</label>
              <select className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500/50">
                <option>每小时</option>
                <option>每天</option>
                <option>每周</option>
                <option>每月</option>
                <option>自定义Cron</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">执行时间</label>
              <input type="time" className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500/50" defaultValue="02:00" />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-400 block mb-1">任务描述</label>
            <textarea className="w-full px-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500/50 resize-none" rows={2} placeholder="描述任务功能..." />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 transition-colors">取消</button>
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors">创建任务</button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-[#1e2030] border border-gray-700/50 rounded-xl p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getTypeIcon(task.type)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white">{task.name}</h4>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        <span className="text-xs text-gray-400">{getStatusLabel(task.status)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Repeat size={11} />
                        <span>{task.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={11} />
                        <span>下次: {task.nextRun}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        上次: {task.lastRun}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      task.status === 'active' 
                        ? 'hover:bg-yellow-500/10 text-yellow-400' 
                        : 'hover:bg-green-500/10 text-green-400'
                    }`}
                    title={task.status === 'active' ? '暂停' : '启动'}
                  >
                    {task.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="编辑">
                    <Edit3 size={14} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="删除">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
