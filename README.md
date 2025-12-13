<p align="center">
  <img src="https://img.icons8.com/fluency/96/quiz.png" alt="QuizHub Logo" width="80"/>
</p>

<h1 align="center">🎯 QuizHub</h1>

<p align="center">
  <strong>Your Ultimate Learning Platform</strong><br/>
  Interactive quizzes, study resources, and progress tracking — all in one place!
</p>

<p align="center">
  <a href="https://quizzzhubb.netlify.app/#/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-QuizHub-blueviolet?style=for-the-badge" alt="Live Demo"/>
  </a>
  <a href="https://github.com/ramkrishnajha5/QuizHub/releases/download/v2.2.0/QuizHub.apk">
    <img src="https://img.shields.io/badge/📱_Download-Android_App-success?style=for-the-badge" alt="Android App"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Firebase-12.6-FFCA28?style=flat-square&logo=firebase" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/Framer_Motion-12.x-FF0055?style=flat-square&logo=framer" alt="Framer Motion"/>
</p>

---

## ✨ Features

### 🧠 Interactive Quizzes
- **24+ Categories** - Choose from a wide range of topics including Science, History, Geography, Entertainment, Sports, and more
- **Customizable Quiz Length** - Select 10, 15, 20, or 25 questions per quiz
- **Timed Quizzes** - Time limits based on question count (10-25 minutes)
- **Random Question Shuffling** - Questions and answers are randomized for a unique experience every time
- **Mark for Review** - Flag questions to revisit before submitting
- **Auto-Save Progress** - Quiz progress is saved every 5 seconds
- **Resume Incomplete Quiz** - Continue from where you left off
- **Keyboard Navigation** - Use keyboard shortcuts for faster navigation

### 📚 Study Resources
- **Google Books Integration** - Access millions of books across 60+ topics
- **6 Major Categories** - Science, Computer Science, Arts & Humanities, Commerce & Business, General Knowledge, Reasoning
- **Save Books to Library** - Bookmark books for later reading
- **Direct Reading Links** - Open books directly on Google Books

### 📊 Dashboard & Analytics
- **Performance Tracking** - View your best scores and total quizzes taken
- **Quiz History** - Access your last 20 quiz attempts with detailed breakdowns
- **View Past Answers** - Review questions, your answers, and correct solutions
- **Time Per Question** - See how long you spent on each question

### 👤 User Profile
- **Profile Management** - Update your name, phone, and date of birth
- **Firebase Authentication** - Secure login with Email/Password or Google
- **Persistent Sessions** - Stay logged in across browser sessions

### 🌓 Modern UI/UX
- **Dark/Light Mode** - Toggle between themes with system preference detection
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Smooth Animations** - Powered by Framer Motion
- **Modern Glassmorphism** - Beautiful backdrop blur effects
- **Gradient Accents** - Vibrant color gradients throughout

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript 5.8, Vite 6 |
| **Styling** | Tailwind CSS, Custom CSS |
| **Animations** | Framer Motion 12 |
| **State Management** | React Context API |
| **Authentication** | Firebase Auth (Email/Google) |
| **Database** | Firebase Firestore |
| **Local Storage** | IndexedDB (idb library) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **APIs** | Open Trivia DB, Google Books API |
| **Deployment** | Netlify |

---

## 📁 Project Structure

```
QuizHub/
├── components/           # Reusable UI components
│   ├── Header.tsx        # Navigation header with theme toggle
│   ├── Footer.tsx        # Site footer
│   ├── Alert.tsx         # Toast notifications
│   ├── LeaveQuizModal.tsx # Confirmation modal for leaving quiz
│   └── DashboardRecentQuizzes.tsx # Quiz history table
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── QuizContext.tsx   # Quiz progress protection
├── pages/                # Application pages
│   ├── Home.tsx          # Landing page
│   ├── Dashboard.tsx     # User dashboard with stats
│   ├── QuizSetup.tsx     # Quiz configuration
│   ├── QuizRunner.tsx    # Active quiz interface
│   ├── Results.tsx       # Quiz results display
│   ├── Study.tsx         # Study resources browser
│   ├── SavedBooks.tsx    # User's saved books
│   ├── Profile.tsx       # User profile management
│   ├── Login.tsx         # Login page
│   ├── Signup.tsx        # Registration page
│   ├── About.tsx         # About us page
│   └── Contact.tsx       # Contact form
├── services/             # External API integrations
│   ├── googleBooks.ts    # Google Books API
│   └── savedBooksService.ts # Saved books Firestore service
├── utils/                # Utility functions
│   ├── api.ts            # Open Trivia DB API
│   ├── firebase.ts       # Firebase configuration
│   ├── idb.ts            # IndexedDB for quiz state
│   └── saveQuizResult.ts # Quiz result Firestore service
├── types.ts              # TypeScript interfaces
├── constants.ts          # App configuration
├── App.tsx               # Main application component
└── index.tsx             # Entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramkrishnajha5/QuizHub.git
   cd QuizHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Update `constants.ts` with your Firebase configuration:
   ```typescript
   export const FIREBASE_CONFIG = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🌐 APIs Used

### Open Trivia Database
- **Purpose**: Fetches quiz questions across 24+ categories
- **Endpoint**: `https://opentdb.com/api.php`
- **Features**: Multiple choice questions, difficulty levels, URL-encoded responses
- **Rate Limiting**: Built-in retry logic with exponential backoff

### Google Books API
- **Purpose**: Search and display book resources for study
- **Endpoint**: `https://www.googleapis.com/books/v1/volumes`
- **Features**: Book search by subject/query, thumbnails, reading links

---

## 📱 Android App

Download the Android APK directly:
- [QuizHub v2.2.0 APK](https://github.com/ramkrishnajha5/QuizHub/releases/download/v2.2.0/QuizHub.apk)

---

## 🎨 Screenshots

| Home Page | Quiz Setup | Active Quiz |
|-----------|------------|-------------|
| Landing page with features | Category & question count selection | Question with timer and palette |

| Results | Dashboard | Study Resources |
|---------|-----------|-----------------|
| Score breakdown with pie chart | Stats and quiz history | Book discovery by subject |

---

## ⌨️ Keyboard Shortcuts (During Quiz)

| Key | Action |
|-----|--------|
| `1-4` | Select answer option |
| `←` / `→` | Navigate questions |
| `M` | Toggle mark for review |
| `S` | Submit quiz |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ram Krishna Jha**

- GitHub: [@ramkrishnajha5](https://github.com/ramkrishnajha5)
- Instagram: [@ramkrishnajha5](https://instagram.com/ramkrishnajha5)

---

<p align="center">
  Made with ❤️ by Ram Krishna Jha
</p>

<p align="center">
  <a href="https://quizzzhubb.netlify.app/#/">
    <img src="https://img.shields.io/badge/🚀_Try_QuizHub_Now-Visit_Site-blueviolet?style=for-the-badge" alt="Visit QuizHub"/>
  </a>
</p>
