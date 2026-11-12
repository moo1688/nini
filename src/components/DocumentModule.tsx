import { useState } from 'react';
import { FileText, FileSpreadsheet, File, Upload, Download, Eye, Edit3, Trash2, Plus, Search, Filter } from 'lucide-react';

interface DocFile {
  id: number;
  name: string;
  type: 'pdf' | 'word' | 'excel';
  size: string;
  modified: string;
  status: 'ready' | 'processing' | 'done';
}

const sampleFiles: DocFile[] = [
  { id: 1, name: '2024年度财务报告.pdf', type: 'pdf', size: '2.4 MB', modified: '2024-12-15', status: 'ready' },
  { id: 2, name: '项目需求文档.docx', type: 'word', size: '856 KB', modified: '2024-12-14', status: 'ready' },
  { id: 3, name: '销售数据统计.xlsx', type: 'excel', size: '1.2 MB', modified: '2024-12-13', status: 'processing' },
  { id: 4, name: '会议纪要_Q4.docx', type: 'word', size: '342 KB', modified: '2024-12-12', status: 'ready' },
  { id: 5, name: '产品规格说明书.pdf', type: 'pdf', size: '5.1 MB', modified: '2024-12-11', status: 'done' },
  { id: 6, name: '员工考勤表.xlsx', type: 'excel', size: '678 KB', modified: '2024-12-10', status: 'ready' },
];

export default function DocumentModule() {
  const [files] = useState<DocFile[]>(sampleFiles);
  const [selectedFile, setSelectedFile] = useState<DocFile | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pdf' | 'word' | 'excel'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(f => {
    const matchesType = activeTab === 'all' || f.type === activeTab;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={18} className="text-red-400" />;
      case 'word': return <File size={18} className="text-blue-400" />;
      case 'excel': return <FileSpreadsheet size={18} className="text-green-400" />;
      default: return <File size={18} className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready': return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">就绪</span>;
      case 'processing': return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">处理中</span>;
      case 'done': return <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">已完成</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">文档处理</h2>
            <p className="text-xs text-gray-500">PDF / Word / Excel 智能解析与处理</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors">
          <Upload size={16} />
          <span>上传文档</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File List */}
        <div className="w-80 border-r border-gray-800 flex flex-col">
          {/* Search & Filter */}
          <div className="p-3 border-b border-gray-800 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文档..."
                className="w-full pl-9 pr-3 py-2 bg-[#1e2030] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'pdf', 'word', 'excel'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    activeTab === tab ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {tab === 'all' ? '全部' : tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-800/50 transition-colors ${
                  selectedFile?.id === file.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-gray-800/30'
                }`}
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.size} · {file.modified}</p>
                </div>
                {getStatusBadge(file.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Document Preview / Actions */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* Document Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile.type)}
                  <div>
                    <h3 className="text-sm font-medium text-white">{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500">{selectedFile.size} · 修改于 {selectedFile.modified}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="查看">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="编辑">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="下载">
                    <Download size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-red-400 hover:text-red-300 transition-colors" title="删除">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* AI Actions */}
              <div className="p-4 border-b border-gray-800">
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">AI 智能操作</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '内容摘要', icon: '📝', desc: '提取文档核心内容' },
                    { label: '格式转换', icon: '🔄', desc: 'PDF/Word/Excel互转' },
                    { label: '数据提取', icon: '📊', desc: '提取表格/图表数据' },
                    { label: '内容翻译', icon: '🌐', desc: '多语言智能翻译' },
                    { label: 'OCR识别', icon: '👁️', desc: '图片文字识别' },
                    { label: '批量处理', icon: '⚡', desc: '多文档批量操作' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#1e2030] border border-gray-700/50 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all"
                    >
                      <span className="text-xl">{action.icon}</span>
                      <span className="text-xs font-medium text-white">{action.label}</span>
                      <span className="text-[10px] text-gray-500">{action.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Content Preview */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  <div className="bg-[#1e2030] border border-gray-700/50 rounded-xl p-8">
                    <h3 className="text-lg font-bold text-white mb-4">文档预览</h3>
                    <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                      <p>这是一份示例文档的预览内容。在实际使用中，此处将显示文档的实际内容。</p>
                      <p className="text-gray-400">LocalAgent 支持以下文档处理能力：</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li>PDF文本提取与智能解析</li>
                        <li>Word文档格式保留与编辑</li>
                        <li>Excel数据读取与分析</li>
                        <li>文档间格式转换</li>
                        <li>基于AI的内容摘要与翻译</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm">选择一个文档查看详情</p>
                <p className="text-gray-600 text-xs mt-1">或上传新文档开始处理</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
