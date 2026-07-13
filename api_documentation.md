# API & Integration Documentation - Engage AI

This document details the core API interfaces, context parameters, and YouTube Live integrations of the Engage AI creator dashboard suite.

---

## 1. Authentication Interface (AuthContext)

Provides Google OAuth and Firebase session controls.

### Interface Types
```typescript
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
```

### Context Hooks (`useAuth()`)
- `currentUser: UserProfile | null` - Currently logged-in creator.
- `loading: boolean` - True if session verification is in progress.
- `loginWithGoogle(): Promise<void>` - Initiates Google Authentication.
- `logout(): Promise<void>` - Terminates creator session.

---

## 2. Dashboard & Crawler Context (DashboardContext)

Manages video analysis queues, comment threads, live chat feeds, and prompt memory.

### Data Schemas

#### Video Schema
```typescript
export interface AnalyzedVideo {
  id: string;
  url: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  comments: Comment[];
  analyzedAt: string;
}
```

#### Comment Schema
```typescript
export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  publishedAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'Question' | 'Feedback' | 'Spam' | 'Appreciation';
  aiReply: string;
  status: 'pending' | 'replied' | 'ignored';
  repliedText?: string;
}
```

#### Learning Feedback Schema
```typescript
export interface LearningFeedback {
  id: string;
  commentText: string;
  originalReply: string;
  editedReply: string;
  reason: string;
  rating: number;
  submittedAt: string;
}
```

### Exponent Methods (`useDashboard()`)
- `analyzeVideo(url: string): Promise<void>` - Crawls comments for the given video URL.
- `approveReply(videoId: string, commentId: string, replyText: string): void` - Publishes comment response back to YouTube.
- `ignoreComment(videoId: string, commentId: string): void` - Flags comment as ignored.
- `updateReplyText(videoId: string, commentId: string, text: string): void` - Updates draft text value.
- `submitFeedback(feedback: Omit<LearningFeedback, 'id' | 'submittedAt'>): void` - Submits correction rating to Prompt Memory.
- `setGlobalBroadcast(message: string | null): void` - Publishes global notification announcement alert.

---

## 3. YouTube Live Integration (LiveChatPage)

Simulates live stream polling feeds:
- Connects live chat stream threads.
- Polls incoming messages periodically.
- Identifies **Super Chats** with payment fields.
- Triggers Quick Actions: **Pin**, **Delete**, **Timeout**, or **Ban**.
