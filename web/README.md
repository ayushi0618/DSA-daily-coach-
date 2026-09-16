# ⚡ DSA Daily Coach - Web Edition

A dedicated, modern web version of **DSA Daily Coach** built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 🌟 Key Features

1. **AI Algorithm Problem Solver**:
   - Integrated with **Google Gemini 2.5 Flash** for deep algorithmic intuition, optimal syntax-highlighted solutions, step-by-step dry runs, and complexity proofs.
   - Intelligent fallback mode when offline or before API key configuration.
   - Multi-language support: **Java**, **Python**, **C++**, **JavaScript**, **Kotlin**, **Go**.
   - Direct links to open questions on **LeetCode**.

2. **Real-Time Streak & Consistency Engine**:
   - Consecutive daily streak tracking with fire badge.
   - 7-Day interactive rolling calendar strip.
   - Leveling & XP progression system.
   - LocalStorage persistence (instant load, private, offline-capable).

3. **Interactive Whiteboard & Animated Video Lectures**:
   - Visual whiteboard animation demonstrating pointer sweeps, hash map lookups, tree traversals, and dynamic programming tables.
   - Timeline controls: Play, pause, restart, step forward/backward, and scene selector.

4. **Revision Vault**:
   - Problem search and topic/difficulty filters.
   - Personal notes storage.
   - Full data portability: 1-click JSON Export & Import backup.

5. **Desktop Study Reminders & Dark Mode**:
   - Browser `Notification` API reminder alerts.
   - Adaptive system dark/light theme toggle.

---

## 🚀 Deployment Options

### Option 1: Vercel (1-Click Deployment)
1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your repository.
4. Set **Root Directory** to `web`.
5. Click **Deploy**. Vercel will auto-detect Vite and deploy your site in ~30 seconds!

### Option 2: GitHub Pages (Automated via GitHub Actions)
1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main` or `master`. The included `.github/workflows/deploy-web.yml` workflow will automatically build and publish the web app to `https://<username>.github.io/<repo-name>/`.

### Option 3: Firebase Hosting
1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. In the `web` directory:
   ```bash
   cd web
   npm run build
   firebase login
   firebase init hosting
   firebase deploy --only hosting
   ```

---

## 💻 Local Development

```bash
# Navigate to the web folder
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
