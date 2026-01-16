import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePromptStore = create(
  persist(
    (set) => ({
      // 预置一些示例数据
      prompts: [
        {
          id: '1',
          title: 'Code Refactor Expert',
          content: 'You are a clean code expert. Refactor the following code to make it more readable and efficient. Use {{language}} best practices.\n\nCode:\n```\n{{code}}\n```',
          tags: ['coding', 'productivity'],
        },
        {
          id: '2',
          title: 'Email Polisher',
          content: 'Rewrite this email to sound more {{tone}} and professional:\n\n"{{email_body}}"',
          tags: ['writing', 'work'],
        }
      ],
      
      addPrompt: (prompt) => set((state) => ({ 
        prompts: [{ ...prompt, id: Math.random().toString(36).substring(7) }, ...state.prompts] 
      })),

      deletePrompt: (id) => set((state) => ({ 
        prompts: state.prompts.filter((p) => p.id !== id) 
      })),

      updatePrompt: (id, newPrompt) => set((state) => ({
        prompts: state.prompts.map((p) => (p.id === id ? { ...p, ...newPrompt } : p))
      })),
    }),
    {
      name: 'prompts-storage', // 数据会自动保存在浏览器的 LocalStorage 中
    }
  )
);