# TRY-REX: AI Trading Mentor

An interactive web application that helps beginners learn trading through gamified challenges, AI evaluation, and real-time market simulations.

## 🦖 Project Overview

**TRY-REX** is an AI-powered trading education platform designed to teach users trading fundamentals through:
- **Trading Game Simulator**: Practice with realistic market conditions
- **AI Evaluation**: Get AI-driven feedback on trading decisions
- **Progress Tracking**: Level up through challenges and XP rewards
- **Market Analysis Tools**: Learn technical analysis with real chart data

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js / React
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Custom CSS
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **API**: RESTful API / GraphQL
- **Real-time**: Firebase Realtime Database or Firestore listeners

### Database & Services
- **Database**: Google Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Vercel (Frontend) + Firebase (Backend Services)

## 📋 Features

### Dashboard
- Overall understanding score and level progression
- Performance metrics (Trend Reading, Entry Timing, Risk Management, Market Structure)
- Total challenges completed with trend indicators
- Accuracy tracking
- Recent activities and daily challenges

### Trading Game Simulator
- Live candlestick charts with technical analysis
- Market situation analysis
- Trade execution (BUY, SELL, WAIT)
- Real-time feedback and scoring

### AI Evaluation
- Trade decision analysis
- Accuracy rating with breakdown
- Personalized mentor feedback (Sara TRY-REX)
- Performance aspect reviews

### Challenge System
- Multiple challenge types
- XP rewards and progression
- Difficulty levels
- Performance tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project setup
- Vercel account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ppddgaming-gif/Try-Rex.git
cd Try-Rex
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Try-Rex/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── TradingGame/
│   │   ├── AIEvaluation/
│   │   └── Shared/
│   ├── pages/
│   ├── services/
│   │   └── firebase/
│   ├── types/
│   └── styles/
├── public/
├── .env.local
├── tsconfig.json
├── package.json
└── README.md
```

## 🗄️ Database Schema (Firestore)

### Collections
- **users**: User profiles and progress
- **challenges**: Challenge definitions and metadata
- **trades**: User trade history and analysis
- **evaluations**: AI trade evaluations
- **leaderboard**: User rankings and achievements

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main

```bash
vercel
```

## 📊 Learning Path

1. **Beginner**: Trend Reading basics
2. **Intermediate**: Entry Timing strategies
3. **Advanced**: Risk Management
4. **Expert**: Market Structure analysis

## 🤖 AI Features

- **Trade Analysis**: Evaluates entry/exit points and timing
- **Personalized Feedback**: Sara TRY-REX mentor provides guidance
- **Performance Metrics**: Tracks accuracy, XP gained, and improvement areas

## 📝 Development Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Make your changes
git add .
git commit -m "feat: add your feature"

# Push to GitHub
git push origin feature/your-feature

# Create a Pull Request
```

## 🤝 Contributing

Contributions are welcome! Please follow the development workflow above.

## 📄 License

This project is private. All rights reserved.

## 👤 Author

- **ppddgaming-gif** - Initial creator

## 🐛 Support & Feedback

For issues or feature requests, please open a GitHub issue.

---

**Happy Trading! 🦖📈**
