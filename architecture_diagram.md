# System Architecture Diagram - Engage AI

The following diagram illustrates the relationship loop and data pipelines of the Engage AI creator dashboard suite:

```mermaid
graph TD
  User[YouTube Creator] -->|1. Authenticates / Configures| Client[Vite + React Dashboard]
  Client -->|2. Logs Session / Custom Settings| Supabase[Supabase Auth / Database]
  
  Client -->|3. Connects Live Streams / Uploads Videos| YT[YouTube Data API v3]
  YT -->|4. Feeds Live Comments / Videos Metadata| Client
  
  Client -->|5. Passes Comment Text + Context Settings| AI[AI Prompt & Reply Calibration Engine]
  AI -->|6. Resolves Personas & Sanitizes Rules| Client
  
  Client -->|7. Approves & Posts response| YT
  Client -->|8. Captures Edits & Feedback Ratings| Learn[AI Learning & Prompt Memory Center]
  Learn -->|9. Tunes Future Custom Prompts| AI
```

## System Components

1. **Frontend Layer (Vite + React + TS)**:
   - High-fidelity single-page dashboard tracking comments queues, live streams, and channel analytics.
   - Built on a fluid dark/light design system using CSS variables.
2. **Persistence & Auth Layer (Supabase & LocalStorage)**:
   - Synchronizes session state, handles profile configurations, and persists videos, error logs, and calibration memories.
3. **YouTube Integration Layer**:
   - Integrates YouTube Data and Live API schemas to fetch comments, channel quotas, and handle response postings.
4. **AI Reply Calibration Engine**:
   - Processes context formatting (e.g. Professional, Spiritual, Gaming) and enforces channel guidelines (link stripping, date replacement).
5. **AI Learning & Feedback Center**:
   - Intercepts approved edits, logging rating indicators to refine future prompt injections dynamically.

## AI Workflow Pipeline

The following flowchart demonstrates the step-by-step pipeline a comment travels through when processed by the AI:

```mermaid
graph TD
  A[New Comment] --> B[Fetch video context]
  B --> C[Categorize]
  C --> D[Detect emotion]
  D --> E[Detect language]
  E --> F[Spam check]
  F --> G[Priority scoring]
  G --> H[Decision]
  H --> I[Generate reply]
  I --> J[Safety check]
  J --> K[Post]
  K --> L[Analytics]
```
