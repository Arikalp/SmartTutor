# Smart Tutor AI - AI-Powered Learning Platform

A comprehensive Next.js learning platform with AI-powered content generation, user authentication, and progress tracking.

## Features

- 🧠 **AI-Powered Learning**: Generate explanations and quizzes using Google Gemini AI
- 📚 **Quick Learn**: Get concise explanations with interactive quizzes
- 🎯 **Deep Learn**: Comprehensive learning modules with structured sections
- 👤 **User Authentication**: Firebase-based user management
- 📊 **Progress Tracking**: Track learning streaks, quiz scores, and study sessions
- 🌙 **Dark Mode**: Complete theme system with user preference persistence
- 📱 **Responsive Design**: Works seamlessly across all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smartutor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/smartutor)

### Manual Deploy

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from `.env.local`
   - Redeploy if necessary

### Environment Variables for Vercel

Set these in your Vercel project settings:

- `GEMINI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Study sessions - users can only access their own
    match /studySessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Quiz results - users can only access their own
    match /quizResults/{resultId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add the key to your environment variables as `GEMINI_API_KEY`

## Project Structure

```
smartutor/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── learn/            # Quick learn page
│   ├── deep-learn/       # Deep learn page
│   ├── progress/         # Progress tracking page
│   └── profile/          # User profile page
├── components/           # React components
├── lib/                 # Utility libraries
│   ├── firebase.ts      # Firebase configuration
│   ├── firestore.ts     # Firestore functions
│   └── gemini.ts        # Gemini AI integration
└── public/              # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.