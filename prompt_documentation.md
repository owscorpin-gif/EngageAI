# Prompt & AI Reply Calibration System - Engage AI

This document details the AI prompts heuristics, voice presets, and rules validation logic of the Engage AI reply generation suite.

---

## 1. Response Personality Presets

Engage AI formats response drafts according to selected personality voice presets:

| Preset Name | Target Audience Tone | System Heuristics Rules |
| :--- | :--- | :--- |
| **Professional** | Brands, Businesses | Polite, formal closing signatures (e.g. *Sincerely*), removes emojis. |
| **Friendly** | Community Channels | Enthusiastic, warm greeting phrases, appends smiles/emojis. |
| **Funny** | Gaming, Entertainment | Witty banter, friendly jokes. |
| **Spiritual** | Mindful, Yoga Creators | Heartfelt blessings, begins with peaceful greeting, appends 🙏. |
| **Gaming** | Game Streamers | Enthusiastic gameplay slang (e.g. *GG*, *Let's go*). |
| **Finance** | Investors, Business | Focuses on clarity, automatically appends a standard financial disclaimer. |
| **Tech** | Developers, Engineers | Technical phrasing, compact, code block formatting if needed. |
| **Education** | Students, Tutorials | Informative structure, step-by-step numbered breakdowns. |
| **Minimal** | Busy Creators | Ultra-short answers (under 5-10 words). |
| **Custom** | Bespoke Voice | Maps guidelines based on the creator's Custom Prompt text builder. |

---

## 2. Moderation Guidelines & Rule Sanitizers

To prevent draft hallucinations or security policy breaches, the Reply Calibration engine runs incoming drafts through rule sanitizers:

### Guidelines Checklist Filters

1. **No External Links**:
   - Matches: `https?://[^\s]+` and `t.me/[^\s]+`
   - Action: Redacts match coordinates to `[Link Removed]` to prevent scam link posting.
2. **Never Promise Release Dates**:
   - Matches: `next week`, `next monday`, `tuesday`, `monday`, `tomorrow`
   - Action: Substitutes concrete dates for general qualifiers (e.g., *soon*, *when ready*) to prevent false creator date commitments.
3. **No Email Sharing**:
   - Matches: Email address regex.
   - Action: Redacts coordinates to `[Email Sanitize]`.
4. **Namaste Signature Constraint**:
   - Action: Appends "Namaste." if the rule matches.

---

## 3. Dynamic Prompt Calibration Loop (AI Learning)

When a creator edits a reply draft, feedback calibration is triggered:
- If rating is **<= 2 Stars**, the learning center automatically formulates a new prompt rule.
- Example: Rating is **2 Stars** because the draft was **"Too formal"** -> System creates rule: *"Adopt a warmer, more casual phrasing for casual viewers."*
- Appends rules to prompt contexts during subsequent drafts.
