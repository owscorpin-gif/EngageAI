# Engage AI - AI YouTube Creator Engagement Suite & Live Assistant Manager

Engage AI is a production-quality, modular, and responsive SaaS web application built to help YouTube creators, brands, and agencies manage and automate their audience interaction. By integrating video comment processing, context-aware reply presets, a real-time live chat overlay, and prompt calibration, Engage AI is a complete YouTube community manager.

---

## Key Features

1. **AI Video Analyzer (Phases 3 & 5)**:
   - Crawls video metadata (transcripts, views, upload date).
   - Segregates comments into: Questions, Praise, Feedback, and Spam.
2. **Comment Intelligence Engine (Phase 6)**:
   - Analyzes comments for sentiment (Positive, Neutral, Negative) and priority tags.
   - Detects spam bots, malicious links, and toxic comments to mute automatic replies.
3. **Calibrated Reply Presets (Phase 7)**:
   - Offers 9 personality voice presets (Professional, Friendly, Funny, Spiritual, Gaming, Finance, Tech, Education, Minimal).
   - Enforces strict custom moderation filters (link stripping, email redacting, release date replacements).
4. **YouTube Live Chat Manager (Phase 8)**:
   - Real-time stream comments feed simulation.
   - Distinct tags for channel Members, Moderators, and highlighted Super Chats.
   - Hover moderation tools: Pin Message, Delete, Timeout, and Ban User.
   - One-click reply suggested drafts injection.
5. **Interactive Analytics (Phase 9)**:
   - Growth area curves (toggling Daily/Weekly/Monthly) and sentiment rings.
   - Horizontal language demographics and category counts charts.
   - Tabular data export to CSV and printable PDF reports.
6. **AI Learning & Prompt Memory (Phase 10)**:
   - Intercepts creator edits, prompting rating surveys and adjustment reasons.
   - Automatically formulates and appends prompt instructions to improve future completions.
7. **Admin Control Panel (Phase 11)**:
   - Consolidated YouTube API Daily Quota gauge monitoring.
   - User account status manager (upgrade plans, suspend access).
   - Global feature flags configuration and system broadcast notification publisher.

---

## Technical Stack & Optimizations

- **Vite + React 19 + TypeScript**: Scalable single-page app layout structure.
- **Tailwind CSS**: Custom dark & light theme configurations.
- **Lazy Routing & Code Splitting**: Incremental module chunking utilizing React `lazy()` and `Suspense` containers.
- **Google Firebase**: Google OAuth and credential session checks.
- **Oxlint**: Optimized code-quality auditing checks.

---

## Project Documentation Registry

- [System Architecture Diagram](file:///Users/syamacandra_das/Downloads/Engage%20ai/architecture_diagram.md) - Pipeline connections overview.
- [API & Integration Specs](file:///Users/syamacandra_das/Downloads/Engage%20ai/api_documentation.md) - Context parameters and types schemas.
- [Database Schema Guide](file:///Users/syamacandra_das/Downloads/Engage%20ai/database_schema.md) - Client caching structure.
- [AI Calibration Prompt System](file:///Users/syamacandra_das/Downloads/Engage%20ai/prompt_documentation.md) - Tone rules and rule sanitizers.
- [Deployment Guide](file:///Users/syamacandra_das/Downloads/Engage%20ai/deployment_guide.md) - Vite bundling and static hosting commands.
- [Developer Onboarding Guide](file:///Users/syamacandra_das/Downloads/Engage%20ai/developer_guide.md) - Command directories and styles guides.
- [Creator User Manual](file:///Users/syamacandra_das/Downloads/Engage%20ai/user_manual.md) - Feature guides and operations steps.
- [Contest Walkthrough Script](file:///Users/syamacandra_das/Downloads/Engage%20ai/contest_demo_script.md) - Showcasing demo workflow.

---

## Local Development Setup

1. Install npm dependencies:
   ```bash
   npm install
   ```
2. Set up local production configuration parameters inside `.env.local`.
3. Boot the local developer server:
   ```bash
   npm run dev
   ```
4. Build static optimized files:
   ```bash
   npm run build
   ```
5. Scan code for style compliance:
   ```bash
   npm run lint
   ```
