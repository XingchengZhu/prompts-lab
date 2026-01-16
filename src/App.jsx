import { useState, useMemo, useEffect } from 'react';
import { usePromptStore } from './store/usePromptStore';
import Fuse from 'fuse.js';
import TextareaAutosize from 'react-textarea-autosize';
import { Search, Plus, Trash2, Copy, Check, Terminal, Command, Github, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 辅助函数：提取字符串中的 {{variable}}
const parseVariables = (text) => {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [...text.matchAll(regex)];
  return [...new Set(matches.map(m => m[1].trim()))]; // 去重
};

function App() {
  const { prompts, addPrompt, deletePrompt, updatePrompt } = usePromptStore();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [copied, setCopied] = useState(false);
  
  // 如果没有选中，默认选中第一个
  useEffect(() => {
    if (!selectedId && prompts.length > 0) {
      setSelectedId(prompts[0].id);
    }
  }, [prompts, selectedId]);

  // 模糊搜索配置
  const fuse = useMemo(() => new Fuse(prompts, {
    keys: ['title', 'content', 'tags'],
    threshold: 0.3,
  }), [prompts]);

  const filteredPrompts = search 
    ? fuse.search(search).map(r => r.item) 
    : prompts;

  const activePrompt = prompts.find(p => p.id === selectedId) || prompts[0];

  // 当切换 Prompt 时，重置变量输入
  useEffect(() => {
    setVariableValues({});
    setCopied(false);
  }, [selectedId]);

  // 生成最终的 Prompt 文本
  const finalPrompt = useMemo(() => {
    if (!activePrompt) return '';
    let text = activePrompt.content;
    const vars = parseVariables(activePrompt.content);
    vars.forEach(v => {
      // 如果没有填值，保留 {{key}} 方便用户看到
      const val = variableValues[v] || `{{${v}}}`;
      text = text.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), val);
    });
    return text;
  }, [activePrompt, variableValues]);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = () => {
    const newId = Math.random().toString(36).substring(7);
    addPrompt({
      id: newId,
      title: 'New Prompt',
      content: 'Write your prompt here using {{variables}}...',
      tags: ['draft']
    });
    setSearch(''); // 清空搜索以便看到新建项
    setTimeout(() => setSelectedId(newId), 50); 
  };

  // 如果列表为空的展示
  if (prompts.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-zinc-900 rounded-full"><Terminal size={32} className="text-indigo-500"/></div>
        <h1 className="text-xl font-bold">Welcome to Prompts Lab</h1>
        <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition">Create First Prompt</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 overflow-hidden font-sans">
      
      {/* 🔴 左侧侧边栏：列表 */}
      <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-900/50">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-4 text-indigo-400">
            <Sparkles size={20} />
            <h1 className="font-bold text-lg tracking-tight text-white">Prompts Lab</h1>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search prompts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredPrompts.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => setSelectedId(prompt.id)}
              className={twMerge(
                "w-full text-left p-3 rounded-lg text-sm transition-all group relative border border-transparent",
                selectedId === prompt.id 
                  ? "bg-zinc-800 border-zinc-700 text-white shadow-sm" 
                  : "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
              )}
            >
              <div className="font-medium truncate pr-6">{prompt.title}</div>
              <div className="text-xs opacity-50 truncate mt-1 font-mono">{prompt.content}</div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); deletePrompt(prompt.id); }}
                className={twMerge(
                  "absolute right-2 top-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all",
                  selectedId === prompt.id ? "hover:bg-red-500/20 text-zinc-400 hover:text-red-400" : "hover:bg-zinc-700 text-zinc-500"
                )}
              >
                <Trash2 size={14} />
              </button>
            </button>
          ))}
          
          {filteredPrompts.length === 0 && (
            <div className="text-center py-10 text-zinc-600 text-sm">No prompts found</div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Plus size={16} /> New Prompt
          </button>
        </div>
      </div>

      {/* 🔵 右侧主区域：编辑器 */}
      {activePrompt && (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
          
          {/* 顶部标题栏 */}
          <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-sm z-10">
            <input 
              value={activePrompt.title}
              onChange={(e) => updatePrompt(activePrompt.id, { title: e.target.value })}
              className="bg-transparent text-xl font-bold text-white focus:outline-none w-full placeholder:text-zinc-700"
              placeholder="Untitled Prompt"
            />
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCopy}
                className={twMerge(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                  copied 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                )}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex">
            {/* 中间：模板编辑区 */}
            <div className="flex-1 p-8 border-r border-zinc-800/50">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 block flex items-center gap-2">
                <Command size={12}/> Template
              </label>
              <TextareaAutosize
                minRows={10}
                value={activePrompt.content}
                onChange={(e) => updatePrompt(activePrompt.id, { content: e.target.value })}
                className="w-full bg-transparent text-zinc-300 font-mono text-sm focus:outline-none resize-none leading-relaxed placeholder:text-zinc-800"
                placeholder="Enter your prompt here. Use {{variable}} to create dynamic fields."
              />
            </div>

            {/* 右侧：变量填充区 & 预览 */}
            <div className="w-96 bg-zinc-900/30 p-8 flex flex-col border-l border-zinc-800">
              
              {/* 变量输入 */}
              <div className="mb-8">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 block">Variables</label>
                <div className="space-y-4">
                  {parseVariables(activePrompt.content).length === 0 ? (
                    <div className="text-sm text-zinc-600 italic">
                      No variables detected. Add <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">{'{{name}}'}</code> to your template.
                    </div>
                  ) : (
                    parseVariables(activePrompt.content).map(v => (
                      <div key={v} className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                        <label className="text-xs text-indigo-400 font-medium ml-1">{v}</label>
                        <input 
                          type="text"
                          value={variableValues[v] || ''}
                          onChange={(e) => setVariableValues({...variableValues, [v]: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                          placeholder={`Value for ${v}...`}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 实时预览 */}
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 block">Preview</label>
                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed select-text">
                  {finalPrompt}
                </div>
              </div>

            </div>
          </div>
          
          {/* 底部署名 - 已固定为 Xingcheng Zhu */}
          <div className="h-8 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end px-4 gap-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1">
              Made by <a href="https://github.com/xingchengzhu" target="_blank" className="text-zinc-500 hover:text-indigo-400 transition-colors">Xingcheng Zhu</a>
            </span>
            <span className="w-px h-3 bg-zinc-800"></span>
            <a href="https://github.com/xingchengzhu/prompts-lab" target="_blank" className="flex items-center gap-1 hover:text-white transition-colors">
              <Github size={10} /> v1.0.0
            </a>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;