<div align="center">

  # 🧪 AI Prompts Lab
  
  **Your personal laboratory for crafting, managing, and testing AI prompts.**
  <br>
  **极客风的 AI 提示词管理与变量测试工具**

  [![React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://react.dev)
  [![Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
  [![Local](https://img.shields.io/badge/Data-Local%20Storage-orange?style=flat-square)](https://github.com/xingchengzhu/prompts-lab)
  
  <br>
</div>

---

![App Screenshot](public/screenshot.png)

## 📖 Introduction

**AI Prompts Lab** is a local-first productivity tool designed for developers and prompt engineers. 

Stop rewriting the same prompts over and over. Use **Variables** (e.g., `{{language}}`, `{{tone}}`) to create reusable templates, fill in the blanks, and copy the perfect prompt to your clipboard instantly.

## ⚡ Features

* **🧩 Variable Support:** Define dynamic slots like `{{code}}` or `{{topic}}` in your prompts.
* **💾 Auto-Save:** All data is stored locally in your browser. No database, no login.
* **🔍 Fuzzy Search:** Instantly find any prompt using Fuse.js.
* **⚡ Live Preview:** See your final prompt update in real-time as you fill variables.
* **🌑 Dark Mode:** A sleek, developer-friendly interface.

## 📦 Getting Started

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/xingchengzhu/prompts-lab.git](https://github.com/xingchengzhu/prompts-lab.git)
    cd prompts-lab
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run development server**
    ```bash
    npm run dev
    ```

## 🛠️ Tech Stack

* **Core:** React 19 + Vite
* **State:** Zustand (with LocalStorage persistence)
* **Styling:** Tailwind CSS v4
* **Search:** Fuse.js
* **Icons:** Lucide React

## 📄 License

MIT License.

---
<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/xingchengzhu">Xingcheng Zhu</a></sub>
</div>