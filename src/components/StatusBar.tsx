import { Cpu, HardDrive, Wifi, WifiOff, Clock } from 'lucide-react';

export default function StatusBar() {
  return (
    <div className="h-7 bg-[#13151c] border-t border-gray-800 flex items-center justify-between px-4 text-xs text-gray-500">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <WifiOff size={12} className="text-green-400" />
          <span>离线模式</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu size={12} />
          <span>CPU: 23%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive size={12} />
          <span>内存: 8.2/16 GB</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Wifi size={12} className="text-gray-600" />
          <span>本地部署</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{new Date().toLocaleTimeString('zh-CN')}</span>
        </div>
      </div>
    </div>
  );
}
