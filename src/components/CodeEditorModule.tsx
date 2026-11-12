import { useState } from 'react';
import { Code2, Play, Save, FolderOpen, Plus, X, Terminal, ChevronRight } from 'lucide-react';

interface Tab {
  id: number;
  name: string;
  language: string;
  content: string;
}

const initialTabs: Tab[] = [
  {
    id: 1,
    name: 'main.py',
    language: 'python',
    content: `#!/usr/bin/env python3
"""
LocalAgent 示例脚本
数据处理与分析模块
"""

import json
import os
from datetime import datetime

class DataProcessor:
    """本地数据处理类"""
    
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = data_dir
        self.cache = {}
        self.logger = self._setup_logger()
    
    def _setup_logger(self):
        """配置日志系统"""
        import logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        return logging.getLogger(__name__)
    
    def load_data(self, filename: str) -> dict:
        """加载JSON数据文件"""
        filepath = os.path.join(self.data_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.logger.info(f"成功加载数据: {filename}")
                return data
        except FileNotFoundError:
            self.logger.error(f"文件不存在: {filepath}")
            return {}
    
    def process(self, data: dict) -> dict:
        """处理数据并返回结果"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'total_items': len(data),
            'processed': True
        }
        return results

if __name__ == "__main__":
    processor = DataProcessor()
    print("LocalAgent 数据处理模块已就绪")
    print(f"数据目录: {processor.data_dir}")`,
  },
  {
    id: 2,
    name: 'config.json',
    language: 'json',
    content: `{
  "agent": {
    "name": "LocalAgent",
    "version": "1.0.0",
    "model": "qwen2.5-7b-q4",
    "max_tokens": 4096,
    "temperature": 0.7
  },
  "system": {
    "max_memory_mb": 8192,
    "gpu_acceleration": false,
    "thread_count": 8
  },
  "features": {
    "chat": true,
    "document_processing": true,
    "code_execution": true,
    "task_scheduler": true,
    "multi_agent": true
  }
}`,
  },
];

const fileTree = [
  { name: 'src', type: 'folder', children: ['main.py', 'utils.py', 'config.json'] },
  { name: 'data', type: 'folder', children: ['sample.json', 'test.csv'] },
  { name: 'scripts', type: 'folder', children: ['run_task.sh', 'backup.py'] },
  { name: 'README.md', type: 'file' },
  { name: 'requirements.txt', type: 'file' },
];

export default function CodeEditorModule() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState(1);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ python main.py',
    'LocalAgent 数据处理模块已就绪',
    '数据目录: ./data',
    '',
    'Process finished with exit code 0',
  ]);
  const [showTerminal, setShowTerminal] = useState(true);

  const currentTab = tabs.find(t => t.id === activeTab);

  const handleRun = () => {
    setTerminalOutput(prev => [
      ...prev,
      '',
      `$ python ${currentTab?.name || 'script.py'}`,
      '> 正在执行...',
      '> 执行完成 ✓',
      `> 耗时: ${(Math.random() * 2 + 0.5).toFixed(2)}s`,
    ]);
  };

  const closeTab = (id: number) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) {
      setActiveTab(newTabs[0].id);
    }
  };

  const getLineNumbers = (content: string) => {
    return content.split('\n').length;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Code2 size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">代码编辑器</h2>
            <p className="text-xs text-gray-500">本地代码编辑与执行环境</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <FolderOpen size={14} />
            <span>打开文件</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Save size={14} />
            <span>保存</span>
          </button>
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-green-600 hover:bg-green-500 text-white transition-colors"
          >
            <Play size={14} />
            <span>运行</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div className="w-52 border-r border-gray-800 flex flex-col bg-[#0d0f14]">
          <div className="p-3 border-b border-gray-800">
            <h4 className="text-xs font-semibold text-gray-400 uppercase">文件浏览器</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {fileTree.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-800/50 cursor-pointer text-sm text-gray-300">
                  <ChevronRight size={12} className={`text-gray-500 ${item.type === 'folder' ? '' : 'invisible'}`} />
                  <span className={item.type === 'folder' ? 'text-yellow-400' : 'text-gray-400'}>
                    {item.type === 'folder' ? '📁' : '📄'}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.type === 'folder' && item.children && (
                  <div className="ml-5">
                    {item.children.map((child, cidx) => (
                      <div key={cidx} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-800/50 cursor-pointer text-sm text-gray-400">
                        <span>📄</span>
                        <span>{child}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center bg-[#0d0f14] border-b border-gray-800">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs cursor-pointer border-r border-gray-800 ${
                  activeTab === tab.id
                    ? 'bg-[#1e2030] text-white border-t-2 border-t-blue-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span>{tab.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="ml-1 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button className="px-3 py-2 text-gray-500 hover:text-white">
              <Plus size={14} />
            </button>
          </div>

          {/* Code Content */}
          <div className="flex-1 overflow-auto bg-[#1e2030]">
            {currentTab && (
              <div className="flex min-h-full">
                {/* Line Numbers */}
                <div className="py-4 px-3 text-right select-none border-r border-gray-800/50">
                  {Array.from({ length: getLineNumbers(currentTab.content) }, (_, i) => (
                    <div key={i} className="text-xs leading-6 text-gray-600">{i + 1}</div>
                  ))}
                </div>
                {/* Code */}
                <pre className="flex-1 p-4 text-sm leading-6 overflow-x-auto">
                  <code className="text-gray-200 font-mono whitespace-pre">
                    {currentTab.content.split('\n').map((line, i) => (
                      <div key={i} className="hover:bg-gray-800/30">
                        {highlightSyntax(line, currentTab.language)}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            )}
          </div>

          {/* Terminal */}
          {showTerminal && (
            <div className="h-44 border-t border-gray-800 bg-[#0d0f14] flex flex-col">
              <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">终端</span>
                </div>
                <button onClick={() => setShowTerminal(false)} className="text-gray-500 hover:text-white">
                  <X size={12} />
                </button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
                {terminalOutput.map((line, i) => (
                  <div key={i} className={`${line.startsWith('$') ? 'text-green-400' : line.startsWith('>') ? 'text-gray-300' : line.includes('✓') ? 'text-green-400' : 'text-gray-400'}`}>
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!showTerminal && (
            <button
              onClick={() => setShowTerminal(true)}
              className="h-6 border-t border-gray-800 bg-[#0d0f14] flex items-center px-4 gap-2 text-xs text-gray-500 hover:text-gray-300"
            >
              <Terminal size={12} />
              <span>显示终端</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple syntax highlighting
function highlightSyntax(line: string, language: string): React.ReactNode {
  if (language === 'python') {
    // Keywords
    const keywords = ['import', 'from', 'class', 'def', 'return', 'if', 'else', 'try', 'except', 'with', 'as', 'not', 'in', 'for', 'while', 'True', 'False', 'None', 'print', 'self'];
    let result = line;
    
    // Comments
    if (line.trim().startsWith('#') || line.trim().startsWith('"""')) {
      return <span className="text-gray-500 italic">{line}</span>;
    }
    
    // Strings
    if (line.includes('"') || line.includes("'")) {
      const parts = line.split(/(["'].*?["'])/g);
      return (
        <span>
          {parts.map((part, i) => {
            if (part.startsWith('"') || part.startsWith("'")) {
              return <span key={i} className="text-green-400">{part}</span>;
            }
            // Check keywords in non-string parts
            let colored = part;
            keywords.forEach(kw => {
              colored = colored.replace(new RegExp(`\\b(${kw})\\b`, 'g'), `__KW__${kw}__KW__`);
            });
            const segments = colored.split(/(__KW__.*?__KW__)/g);
            return (
              <span key={i}>
                {segments.map((seg, j) => {
                  if (seg.startsWith('__KW__')) {
                    const word = seg.replace(/__KW__/g, '');
                    return <span key={j} className="text-purple-400">{word}</span>;
                  }
                  return <span key={j} className="text-gray-200">{seg}</span>;
                })}
              </span>
            );
          })}
        </span>
      );
    }
    
    // Simple keyword highlighting for non-string lines
    keywords.forEach(kw => {
      result = result.replace(new RegExp(`\\b(${kw})\\b`, 'g'), `__KW__${kw}__KW__`);
    });
    
    if (result.includes('__KW__')) {
      const segments = result.split(/(__KW__.*?__KW__)/g);
      return (
        <span>
          {segments.map((seg, i) => {
            if (seg.startsWith('__KW__')) {
              return <span key={i} className="text-purple-400">{seg.replace(/__KW__/g, '')}</span>;
            }
            return <span key={i} className="text-gray-200">{seg}</span>;
          })}
        </span>
      );
    }
  }
  
  if (language === 'json') {
    // Simple JSON highlighting
    const parts = line.split(/("(?:[^"\\]|\\.)*")/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('"') && part.endsWith('"')) {
            if (line.includes(':') && line.indexOf(part) < line.indexOf(':')) {
              return <span key={i} className="text-blue-400">{part}</span>;
            }
            return <span key={i} className="text-green-400">{part}</span>;
          }
          // Numbers
          const numParts = part.split(/(\b\d+\b)/g);
          return (
            <span key={i}>
              {numParts.map((np, j) => (
                /^\d+$/.test(np) ? <span key={j} className="text-yellow-400">{np}</span> : <span key={j} className="text-gray-200">{np}</span>
              ))}
            </span>
          );
        })}
      </span>
    );
  }
  
  return <span className="text-gray-200">{line}</span>;
}
