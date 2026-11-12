import { useState, useEffect } from 'react';
import { Cpu, HardDrive, MemoryStick, Thermometer, Activity, Server, Zap, Shield } from 'lucide-react';

interface SystemStat {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

export default function SystemDashboard() {
  const [stats, setStats] = useState({
    cpu: 23,
    memory: 51,
    disk: 67,
    temperature: 45,
  });
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 30 + 15),
        memory: Math.floor(Math.random() * 10 + 48),
        disk: 67,
        temperature: Math.floor(Math.random() * 10 + 40),
      });
      setUptime(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const systemStats: SystemStat[] = [
    { label: 'CPU 使用率', value: `${stats.cpu}%`, percentage: stats.cpu, color: 'blue' },
    { label: '内存使用', value: `${(stats.memory / 100 * 16).toFixed(1)} / 16 GB`, percentage: stats.memory, color: 'purple' },
    { label: '磁盘空间', value: '338 / 512 GB', percentage: stats.disk, color: 'emerald' },
    { label: 'CPU 温度', value: `${stats.temperature}°C`, percentage: (stats.temperature / 100) * 100, color: 'orange' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return { bar: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' };
      case 'purple': return { bar: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' };
      case 'emerald': return { bar: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' };
      case 'orange': return { bar: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' };
      default: return { bar: 'bg-gray-500', bg: 'bg-gray-500/10', text: 'text-gray-400' };
    }
  };

  const services = [
    { name: 'LLM 推理引擎', status: 'running', detail: 'Qwen2.5-7B-Q4_K_M · 4.2GB', icon: <Zap size={16} /> },
    { name: '文档处理服务', status: 'running', detail: 'Apache Tika · 就绪', icon: <Server size={16} /> },
    { name: '任务调度器', status: 'running', detail: '6 个活跃任务', icon: <Activity size={16} /> },
    { name: '多Agent协调器', status: 'running', detail: '6 个Agent在线', icon: <Shield size={16} /> },
    { name: '向量数据库', status: 'running', detail: 'ChromaDB · 12,458 条记录', icon: <HardDrive size={16} /> },
    { name: '代码执行沙箱', status: 'idle', detail: 'Python 3.11 · 待命', icon: <Cpu size={16} /> },
  ];

  const recentLogs = [
    { time: '14:32:15', level: 'info', message: '文档处理任务完成: 2024年度财务报告.pdf' },
    { time: '14:30:02', level: 'info', message: 'Agent[代码助手] 完成代码审查任务 #1523' },
    { time: '14:28:45', level: 'warn', message: '内存使用率超过50%，建议关闭不必要的应用' },
    { time: '14:25:30', level: 'info', message: '定时任务执行: 临时文件清理完成' },
    { time: '14:20:12', level: 'info', message: '向量数据库索引更新完成 (+23条)' },
    { time: '14:15:00', level: 'info', message: '系统健康检查通过' },
    { time: '14:10:33', level: 'error', message: '日志归档任务失败: 权限不足' },
    { time: '14:05:18', level: 'info', message: '新Agent注册: 翻译Agent' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">系统面板</h2>
            <p className="text-xs text-gray-500">硬件状态与服务监控</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2030] border border-gray-700">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-300">运行时间: {formatUptime(uptime)}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* System Info Card */}
        <div className="bg-[#1e2030] border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">系统配置</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0f1117] rounded-lg p-3">
              <p className="text-xs text-gray-500">处理器</p>
              <p className="text-sm text-white font-medium mt-1">Intel i5-13400</p>
              <p className="text-xs text-gray-500">10核16线程 · 2.5GHz</p>
            </div>
            <div className="bg-[#0f1117] rounded-lg p-3">
              <p className="text-xs text-gray-500">内存</p>
              <p className="text-sm text-white font-medium mt-1">16 GB DDR4</p>
              <p className="text-xs text-gray-500">双通道 · 3200MHz</p>
            </div>
            <div className="bg-[#0f1117] rounded-lg p-3">
              <p className="text-xs text-gray-500">显卡</p>
              <p className="text-sm text-white font-medium mt-1">Intel UHD 730</p>
              <p className="text-xs text-gray-500">核显 · CPU推理模式</p>
            </div>
            <div className="bg-[#0f1117] rounded-lg p-3">
              <p className="text-xs text-gray-500">操作系统</p>
              <p className="text-sm text-white font-medium mt-1">Windows 11 26H2</p>
              <p className="text-xs text-gray-500">Build 26100</p>
            </div>
          </div>
        </div>

        {/* Resource Monitors */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStats.map((stat) => {
            const colors = getColorClasses(stat.color);
            return (
              <div key={stat.label} className="bg-[#1e2030] border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">{stat.label}</span>
                  <span className={`text-xs font-medium ${colors.text}`}>{stat.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{stat.percentage}%</p>
              </div>
            );
          })}
        </div>

        {/* Services & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Services */}
          <div className="bg-[#1e2030] border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">服务状态</h3>
            <div className="space-y-3">
              {services.map((service, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    service.status === 'running' ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{service.name}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        service.status === 'running' ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <p className="text-xs text-gray-500">{service.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logs */}
          <div className="bg-[#1e2030] border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">系统日志</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-gray-800/30">
                  <span className="text-gray-600 flex-shrink-0 font-mono">{log.time}</span>
                  <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    log.level === 'info' ? 'bg-blue-500/20 text-blue-400' :
                    log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div className="bg-[#1e2030] border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">模型信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f1117] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick size={14} className="text-blue-400" />
                <span className="text-xs text-gray-400">主模型</span>
              </div>
              <p className="text-sm text-white font-medium">Qwen2.5-7B-Instruct</p>
              <p className="text-xs text-gray-500 mt-1">量化: Q4_K_M · 4.2GB</p>
              <p className="text-xs text-gray-500">上下文: 8192 tokens</p>
            </div>
            <div className="bg-[#0f1117] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={14} className="text-purple-400" />
                <span className="text-xs text-gray-400">代码模型</span>
              </div>
              <p className="text-sm text-white font-medium">CodeQwen-7B-Chat</p>
              <p className="text-xs text-gray-500 mt-1">量化: Q4_K_M · 4.5GB</p>
              <p className="text-xs text-gray-500">上下文: 8192 tokens</p>
            </div>
            <div className="bg-[#0f1117] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-emerald-400" />
                <span className="text-xs text-gray-400">轻量模型</span>
              </div>
              <p className="text-sm text-white font-medium">Qwen2.5-3B-Instruct</p>
              <p className="text-xs text-gray-500 mt-1">量化: Q4_K_M · 2.1GB</p>
              <p className="text-xs text-gray-500">上下文: 4096 tokens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
