import { useState, useMemo, useEffect } from 'react';
import { usePromptStore } from './store/usePromptStore';
import Fuse from 'fuse.js';
import TextareaAutosize from 'react-textarea-autosize';
import { Search, Plus, Trash2, Copy, Check, Command, Github, Sparkles, Sun, Moon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// 辅助函数：提取字符串中的 {{variable}}
const parseVariables = (text) => {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [...text.matchAll(regex)];
  return [...new Set(matches.map(m => m[1].trim()))]; // 去重
};

function App() {
  const { prompts, addPrompt, deletePrompt, updatePrompt, theme, toggleTheme } = usePromptStore();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [copied, setCopied] = useState(false);
  
  // 1. 监听主题变化，切换 DOM 类名
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

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

  useEffect(() => {
    setVariableValues({});
    setCopied(false);
  }, [selectedId]);

  const finalPrompt = useMemo(() => {
    if (!activePrompt) return '';
    let text = activePrompt.content;
    const vars = parseVariables(activePrompt.content);
    vars.forEach(v => {
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
    setSearch('');
    setTimeout(() => setSelectedId(newId), 50); 
  };

  // 空状态
  if (prompts.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 transition-colors">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-lg"><Sparkles size={32} className="text-indigo-500"/></div>
        <h1 className="text-xl font-bold">Welcome to Prompts Lab</h1>
        <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">Create First Prompt</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 transition-colors duration-300">
      
      {/* 🔴 左侧侧边栏 */}
      <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900/50 backdrop-blur-xl transition-colors duration-300">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles size={20} />
              <h1 className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">Prompts Lab</h1>
            </div>
            
            {/* 🌗 主题切换按钮 */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search prompts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredPrompts.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => setSelectedId(prompt.id)}
              className={twMerge(
                "w-full text-left p-3 rounded-lg text-sm transition-all group relative border",
                selectedId === prompt.id 
                  ? "bg-white dark:bg-zinc-800 border-indigo-200 dark:border-zinc-700 shadow-sm ring-1 ring-indigo-500/10 z-10" 
                  : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <div className={twMerge("font-medium truncate pr-6 transition-colors", selectedId === prompt.id ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300")}>
                {prompt.title}
              </div>
              <div className="text-xs opacity-60 truncate mt-1 font-mono">{prompt.content}</div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); deletePrompt(prompt.id); }}
                className={twMerge(
                  "absolute right-2 top-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all",
                  selectedId === prompt.id 
                    ? "hover:bg-red-50 text-zinc-400 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400" 
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400"
                )}
              >
                <Trash2 size={14} />
              </button>
            </button>
          ))}
          
          {filteredPrompts.length === 0 && (
            <div className="text-center py-10 text-zinc-400 dark:text-zinc-600 text-sm">No prompts found</div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button 
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={16} /> New Prompt
          </button>
        </div>
      </div>

      {/* 🔵 右侧主区域：编辑器 */}
      {activePrompt && (
        <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative transition-colors duration-300">
          
          {/* 顶部标题栏 */}
          <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-10 transition-colors">
            <input 
              value={activePrompt.title}
              onChange={(e) => updatePrompt(activePrompt.id, { title: e.target.value })}
              className="bg-transparent text-xl font-bold text-zinc-900 dark:text-white focus:outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-700 transition-colors"
              placeholder="Untitled Prompt"
            />
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCopy}
                className={twMerge(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm active:scale-95",
                  copied 
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400" 
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                )}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex">
            {/* 中间：模板编辑区 */}
            <div className="flex-1 p-8 border-r border-zinc-200 dark:border-zinc-800/50 transition-colors">
              <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 block flex items-center gap-2">
                <Command size={12}/> Template
              </label>
              <TextareaAutosize
                minRows={10}
                value={activePrompt.content}
                onChange={(e) => updatePrompt(activePrompt.id, { content: e.target.value })}
                className="w-full bg-transparent text-zinc-800 dark:text-zinc-300 font-mono text-sm focus:outline-none resize-none leading-relaxed placeholder:text-zinc-300 dark:placeholder:text-zinc-700 transition-colors"
                placeholder="Enter your prompt here. Use {{variable}} to create dynamic fields."
              />
            </div>

            {/* 右侧：变量填充区 & 预览 */}
            <div className="w-96 bg-zinc-100/50 dark:bg-zinc-900/30 p-8 flex flex-col border-l border-zinc-200 dark:border-zinc-800 transition-colors">
              
              {/* 变量输入 */}
              <div className="mb-8">
                <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 block">Variables</label>
                <div className="space-y-4">
                  {parseVariables(activePrompt.content).length === 0 ? (
                    <div className="text-sm text-zinc-500 dark:text-zinc-600 italic border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-center">
                      No variables detected.<br/> Add <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-bold">{'{{name}}'}</code> to your template.
                    </div>
                  ) : (
                    parseVariables(activePrompt.content).map(v => (
                      <div key={v} className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                        <label className="text-xs text-indigo-500 dark:text-indigo-400 font-medium ml-1 flex items-center gap-1">
                          {v}
                        </label>
                        <input 
                          type="text"
                          value={variableValues[v] || ''}
                          onChange={(e) => setVariableValues({...variableValues, [v]: e.target.value})}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm"
                          placeholder={`Value for ${v}...`}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 实时预览 */}
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 block">Preview</label>
                <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed select-text shadow-sm transition-colors">
                  {finalPrompt}
                </div>
              </div>

            </div>
          </div>
          
          {/* 底部署名 */}
          <div className="h-8 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-end px-4 gap-4 text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-bold transition-colors">
            <span className="flex items-center gap-1">
              Made by <a href="https://github.com/xingchengzhu" target="_blank" className="text-zinc-500 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Xingcheng Zhu</a>
            </span>
            <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-800"></span>
            <a href="https://github.com/xingchengzhu/prompts-lab" target="_blank" className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              <Github size={10} /> v1.1.0
            </a>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;