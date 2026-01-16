import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePromptStore = create(
  persist(
    (set) => ({
      // 🚀 默认提示词数据
      prompts: [
        {
          id: '1',
          title: 'Code Refactor Expert',
          content: 'You are a Clean Code expert. Refactor the following code to make it more readable, modular, and efficient. Follow {{language}} best practices and naming conventions.\n\nCode:\n```\n{{code}}\n```',
          tags: ['coding', 'dev'],
        },
        {
          id: '2',
          title: 'Email Polisher',
          content: 'Rewrite this email to sound more {{tone}} (e.g., professional, friendly, urgent) and correct any grammar mistakes:\n\n"{{email_body}}"',
          tags: ['writing', 'work'],
        },
        {
          id: '3',
          title: 'Midjourney Photorealism',
          content: '/imagine prompt: A cinematic shot of {{subject}}, {{lighting}} lighting, highly detailed, 8k resolution, shot on 35mm lens, f/1.8, style of {{photographer}} --ar 16:9 --v 6.0',
          tags: ['art', 'midjourney'],
        },
        {
          id: '4',
          title: 'YouTube Viral Hooks',
          content: 'Write 3 viral, click-baity opening hooks for a YouTube video about "{{topic}}". \nTarget Audience: {{audience}}\nGoal: Keep them watching past the first 30 seconds.',
          tags: ['marketing', 'social'],
        },
        {
          id: '5',
          title: 'Regex Generator',
          content: 'Write a Regular Expression (Regex) in {{language}} that matches the following pattern: {{pattern_description}}. Explain how it works step-by-step.',
          tags: ['coding', 'tool'],
        },
        {
          id: '6',
          title: 'SaaS Landing Page Hero',
          content: 'Write 5 variations of a Hero Section Headline and Sub-headline for a SaaS product that helps {{target_audience}} to {{core_benefit}}. \nTone: {{tone}}',
          tags: ['marketing', 'copywriting'],
        },
        {
          id: '7',
          title: 'ELl5 (Explain Like I\'m 5)',
          content: 'Explain the concept of "{{concept}}" to a 5-year-old using simple analogies and examples involving {{analogy_topic}} (e.g., lego, cars, animals).',
          tags: ['learning', 'fun'],
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
      name: 'prompts-storage-v2',
    }
  )
);