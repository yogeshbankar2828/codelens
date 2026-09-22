# CodeLens — AI-Powered Code Review Platform

CodeLens is an intelligent code review and repository analysis platform. It leverages Google's Gemini AI to automatically review GitHub pull requests for bugs, security vulnerabilities, and code quality. It also features a semantic AI Code Search that lets you ask questions directly about your codebase using RAG (Retrieval-Augmented Generation) and vector embeddings.

## ✨ Features
- **Automated PR Analysis**: Gets triggered on your PRs to detect logic errors, null pointers, security injections, and bad practices.
- **AI Code Search**: Uses `gemini-embedding-001` and PostgreSQL `pgvector` to semantically search your codebase.
- **GitHub Integration**: Secure GitHub OAuth login and Webhooks for real-time repository syncing.
- **Asynchronous Processing**: Background workers powered by Bull and Redis to handle heavy AI inference without blocking the UI.
- **Clean UI**: Built with React, Tailwind CSS, and Lucide icons for a bright, developer-friendly experience.

## ⚠️ Important Note on Performance & APIs

This project is currently configured to use **free-tier APIs** for its cloud services. As a result, you may occasionally experience the following:

- **High Response Times**: Cold starts or high latency when generating AI reviews.
- **API Rate Limits**: The Google Gemini API may occasionally return `503 Service Unavailable` ("experiencing high demand") errors. If this happens, please wait a minute and try again.
- **Database Sleep**: The Neon Serverless PostgreSQL and Upstash Redis databases may pause during periods of inactivity, causing the first request after a long break to take up to 60 seconds.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: Serverless PostgreSQL (Neon) with `pgvector` extension
- **Queue/Cache**: BullMQ, Redis (Upstash)
- **AI**: Google Gemini API (`gemini-3.6-flash`, `gemini-embedding-001`)

## 🚀 Getting Started

### 1. Environment Variables
You will need to set up a `.env` file in the `backend/` directory with the following keys:
```env
DATABASE_URL=postgresql://<user>:<password>@<neon-url>/<db>?sslmode=require
REDIS_URL=rediss://default:<password>@<upstash-url>:6379
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Run the Backend
```bash
cd backend
npm install
npm start
```

### 3. Run the Background Worker
```bash
cd backend
npm run worker
```

### 4. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📜 License
MIT License
