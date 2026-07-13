# Database & Storage Schema Documentation - Engage AI

This document details the persistent storage schemas, keys, and structures utilized by the Engage AI creator dashboard suite.

---

## 1. Local Storage Cache Tables

Since the system supports serverless client-side caching to guarantee rapid load performance, it persists the following JSON datasets inside the user's `localStorage` profile:

### Table: `engage_ai_videos` (Analyzed Video Threads)
Stores historical crawled video transcripts, metadata, comments lists, and response proposal logs.
```json
[
  {
    "id": "string (Video ID)",
    "url": "string (YouTube Video URL)",
    "title": "string (Video Title)",
    "channelTitle": "string (YouTube Channel Name)",
    "thumbnail": "string (Thumbnail URL)",
    "views": "string (Views stats count)",
    "publishedAt": "string (Upload timeframe)",
    "comments": [
      {
        "id": "string (Comment ID)",
        "authorName": "string",
        "authorAvatar": "string",
        "text": "string (Original comment text)",
        "publishedAt": "string",
        "sentiment": "positive | neutral | negative",
        "category": "Question | Feedback | Spam | Appreciation",
        "aiReply": "string (Draft response proposal text)",
        "status": "pending | replied | ignored",
        "repliedText": "string? (Final posted text value)"
      }
    ],
    "analyzedAt": "string (ISO timestamp)"
  }
]
```

### Table: `engage_ai_learning_feedbacks` (Calibration Memory Log)
Stores correction diff comparisons to fine-tune future prompt parameters.
```json
[
  {
    "id": "string (Feedback ID)",
    "commentText": "string (Original viewer query)",
    "originalReply": "string (First AI draft proposal)",
    "editedReply": "string (Creator corrected response)",
    "reason": "Too formal | Too informal | Incorrect details | Wrong tone | Other",
    "rating": "number (1 to 5)",
    "submittedAt": "string (Locale timestamp)"
  }
]
```

### Table: `engage_ai_prompt_rules` (Tuned Prompt Heuristics)
List of active system prompt boundaries compiled from low calibration ratings.
```json
[
  "string (Instruction sentence)",
  "Avoid emojis for critical feedback responses",
  "Keep educational breakdowns below 3 sentences"
]
```

### Table: `engage_ai_global_broadcast` (System Banner Announcement)
Stores active site-wide administrator broadcast warnings.
```json
"Scheduled maintenance tonight at 2:00 AM PST. SaaS features will experience brief interruptions."
```
