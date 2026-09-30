# DSA Daily Coach

![DSA Daily Coach](https://img.shields.io/badge/Status-Active-success) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)

**DSA Daily Coach** is a modern, responsive web application designed to help developers prepare for technical interviews. It combines a rich problem library with an interactive coding workspace, gamified progress tracking, and AI-assisted learning tools. 

## 🚀 Features

* **📚 Interactive Problem Library**: A searchable and filterable database of algorithmic problems categorized by difficulty, topic, and target company.
* **💻 Integrated Coding Workspace**: A split-pane coding environment featuring problem descriptions alongside a dedicated code editor and test-case runner interface.
* **🤖 AI-Powered Tutor**: A built-in chat assistant designed to act as a personal tutor, helping users debug code and grasp complex algorithmic concepts.
* **🎬 Animated Visual Lectures**: A learning module that breaks down complex algorithms step-by-step with interactive UI animations.
* **🧠 Revision Vault**: A dedicated flashcard interface utilizing spaced repetition to review previously solved problems.
* **📈 Gamification & Analytics**: Comprehensive statistics tracking daily login streaks, total problems solved, and a leveling system to keep users motivated.
* **🌗 Bespoke Dual-Theme Design**: A beautiful, eye-safe pastel light theme and a strict, distraction-free deep dark mode.
* **📊 Algorithm Visualizer**: Animated bar-chart visualizations for Bubble Sort, Merge Sort, Quick Sort, and Binary Search — with play/pause, speed & array-size controls, step counter, and live time/space complexity badges.
* **🧩 15 Core Patterns Library**: The essential DSA patterns (Sliding Window, Two Pointers, DP, …) with when-to-use guides, code templates, and curated LeetCode practice links — plus an interactive Big-O cheat sheet with a growth-rate chart.
* **🎤 Mock Interview Mode**: Timed 30/45-minute mock interviews from a bank of real LeetCode problems, with a 4-axis self-assessment rubric (correctness, complexity, edge cases, communication) and session history.
* **🗓️ 7-Day Study Plan Generator**: Analyzes your solve history to find weak topics and builds a day-by-day plan with LeetCode links, progress checkboxes, and XP rewards.
* **🔁 SM-2 Spaced Repetition**: The Revision Vault now schedules reviews with Again/Hard/Good/Easy grading and a "Due for review" queue so you retain what you solve.

## 🛠️ Technical Stack

* **Frontend Framework:** React.js
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Build Tool:** Vite
* **Icons:** Lucide React

## 📦 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dsa-daily-coach.git
   cd dsa-daily-coach
   ```

2. **Navigate to the web directory**
   ```bash
   cd web
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 📂 Project Structure

```text
dsa-daily-coach/
├── web/
│   ├── public/              # Static assets (App Icons, Manifest)
│   ├── src/                 
│   │   ├── components/      # Reusable React components (Navbar, HomeView, etc.)
│   │   ├── types.ts         # TypeScript interfaces and types
│   │   ├── App.tsx          # Main application entry point
│   │   ├── main.tsx         # React DOM rendering
│   │   └── index.css        # Tailwind directives and global styles
│   ├── package.json         # Project dependencies and scripts
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── vite.config.ts       # Vite configuration
└── README.md
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

## 📄 License

This project is licensed under the MIT License.
