# 🎯 KarmaQuiz

> Fun trivia inspired by the subreddits you love! Decode emojis, test your Reddit knowledge, and climb the leaderboards.


---

## 🧠 What is KarmaQuiz?

**KarmaQuiz** gamifies Reddit by transforming its most viral and controversial content into engaging quiz questions. Whether you're decoding emojis, guessing which post got the most upvotes, or answering general trivia, KarmaQuiz brings Reddit culture to life in a fun, interactive format.

---

## 🚀 Features

- 🔄 **Fresh Daily Content**: Quiz questions are generated daily from top Reddit posts and comments using the Reddit API.
- 📚 **Trivia Modes**:
  - *Subreddit-based Quizzes*: Identify viral posts and debated comments.
  - *Emoji Challenges*: Decode emoji riddles based on Reddit topics.
  - *General Knowledge*: Powered by Open Trivia DB.
- ⚡ **Real-time Leaderboard**: See where you rank globally—powered by Redis for lightning-fast updates.
- 🎛️ **Custom Subreddit Selection**: Pick your favorite subreddits and quiz away.
- 📈 **Track Your Progress**: Earn points, climb levels, and unlock more quiz modes.
- 🎲 **Upcoming Events** *(Coming Soon!)*: Compete in limited-time events and earn exclusive badges.

---

## 🏗️ Tech Stack

- **Frontend**: React + Devvit UI
- **Backend**: Reddit API, Open Trivia DB, Redis
- **Data Handling**: Async fetching, JSON transformation, daily refresh cycle
- **Hosting**: Vercel (or specify your platform)

---

## 💡 Inspiration

Reddit is a goldmine of ideas, creativity, debates, and memes. KarmaQuiz was created to turn that energy into an interactive trivia experience—celebrating the wild, witty, and weird world of Reddit while letting you test your knowledge of it.

---

## ⚙️ How It Works

1. Fetches top daily posts/comments from selected subreddits.
2. Formats them into trivia-style questions.
3. Adds variety using Open Trivia DB’s general questions.
4. Stores scores and progress in Redis.
5. Displays everything in a clean, responsive UI with real-time leaderboard updates.

---

## 🧪 Challenges Faced

- 🌀 Handling asynchronous Reddit API calls and large JSON responses.
- 📈 Building a real-time leaderboard with frequent updates via Redis.
- 🚦 Avoiding API rate limits while maintaining fresh daily content.

---

## ✅ What I’m Proud Of

- Built a dynamic, daily-refreshing quiz engine using real Reddit content.
- Created real-time, competitive functionality with scalable storage.
- Designed an interactive experience blending fun, learning, and community vibes.

---

## 🛠️ What's Next

- 🤖 **AI Summarization**: Automatically shorten long Reddit posts into quiz-friendly formats.
- 🏅 **Event-Based Categories**: Compete in temporary quiz events for rewards and badges.
- ♟️ **Strategic Layer**: Unlock, trade, and challenge other players in subreddit-based tactical modes.

---

## 📦 Installation (For Devs)

```bash
git clone https://github.com/yourusername/KarmaQuiz.git
cd KarmaQuiz
npm install
npm run dev


Set up .env with:

```env
REDDIT_CLIENT_ID=your_id
REDDIT_SECRET=your_secret
REDDIT_USER_AGENT=karmaquiz
REDIS_URL=redis://localhost:6379
🌐 Try It Out
🔗 Live Demo
📁 GitHub Repo

🤝 Contributions
Open to PRs, ideas, and collabs. If you're a Reddit nerd or quiz junkie, let’s connect!

📜 License
MIT License. See LICENSE for details.

💬 Contact
Built with ❤️ by Ujjwal Kuikel
Email: ujjwalkuikel2002@gmail.com
