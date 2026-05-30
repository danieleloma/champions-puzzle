# Arsenal Premier League Celebration Puzzle App
# Comprehensive Product Requirements Document (PRD)

---

# 1. Product Overview

## Product Summary

A mobile-first jigsaw puzzle web app built around Arsenal’s Premier League title celebration moments.

Users solve interactive puzzles using iconic celebration images from the title-winning season while competing for the fastest completion times on global leaderboards.

The experience is designed to:
- Keep the excitement of the title win alive
- Create replayable football-themed gameplay
- Encourage friendly competition
- Drive viral social sharing
- Be instantly accessible without sign-up friction

---

# 2. Product Vision

Create the most engaging football celebration puzzle experience on mobile web.

The app should feel:
- Fast
- Emotional
- Competitive
- Social
- Addictive
- Accessible to all ages

The product should combine:
- Casual gaming
- Football fandom
- Speed competition
- Social bragging rights

---

# 3. Goals

# Primary Goals

- Extend fan excitement after the title win
- Create a replayable casual gaming experience
- Drive social sharing through achievements
- Build a highly competitive leaderboard ecosystem

---

# Secondary Goals

- Increase repeat sessions
- Encourage challenge sharing
- Enable future seasonal puzzle drops
- Build foundation for future football game experiences

---

# 4. Target Audience

## Age Range

6–60 years old

---

## Audience Types

### Casual Fans
- Play occasionally
- Enjoy celebration imagery
- Want easy gameplay

### Competitive Players
- Chase fastest times
- Compete globally
- Replay puzzles repeatedly

### Arsenal Fans
- Emotionally connected to celebration moments
- Want collectible experiences
- Share achievements socially

---

# 5. Platforms

## MVP Platforms

- Mobile web (primary)
- Desktop web (responsive)
- Tablet web

---

# 6. Product Principles

## Core Principles

### 1. Instant Play
Users should play within seconds.

### 2. No Sign-Up Friction
No email/password required.

### 3. Mobile-First Experience
Everything optimized for touch.

### 4. Social-First Gameplay
Every win should be shareable.

### 5. Competitive Replayability
Leaderboards should encourage replaying.

---

# 7. User Identity System

# 7.1 Authentication Philosophy

The app should not require account creation.

Users:
- Open app
- Create username once
- Begin playing immediately

The user’s native device becomes the primary identity.

---

# 7.2 First-Time User Flow

```text
Open app
    ↓
Splash animation
    ↓
Enter username
    ↓
Choose first puzzle
    ↓
Start playing instantly
```

Target onboarding time:
Under 15 seconds.

---

# 7.3 Device-Based Identity

System generates:
- Unique device ID
- Persistent local session
- Username-linked profile

Stored using:
- LocalStorage
- IndexedDB
- Secure cookies

---

# 7.4 Returning User Experience

When users revisit:

```text
Device recognized
    ↓
Profile restored
    ↓
Progress restored
    ↓
Leaderboard identity restored
```

---

# 7.5 Username Rules

Requirements:
- Globally unique
- 3–20 characters
- Limited rename cooldown
- Family-friendly moderation

Examples:
- GoonerKing
- SakaSpeed
- NorthLondonLegend

---

# 8. Core Gameplay System

# 8.1 Gameplay Loop

```text
Select puzzle
    ↓
Select difficulty
    ↓
Solve puzzle
    ↓
Timer stops
    ↓
Leaderboard updated
    ↓
Share victory
    ↓
Replay or unlock next stage
```

---

# 8.2 Puzzle Mechanics

## Features

- Drag-and-drop tiles
- Snap-to-position logic
- Tile locking
- Completion detection
- Touch gestures
- Hint system
- Preview mode

---

# 8.3 Puzzle Types

## MVP

- Square tile puzzles

---

## Future

- Irregular jigsaw pieces
- Rotatable pieces
- Timed puzzle modes
- Multiplayer race puzzles

---

# 9. Difficulty System

# 9.1 Difficulty Stages

| Stage | Grid | Tile Count |
|---|---|---|
| Beginner | 3x3 | 9 |
| Easy | 4x4 | 16 |
| Medium | 5x5 | 25 |
| Hard | 6x6 | 36 |
| Expert | 8x8 | 64 |
| Legendary | 10x10 | 100 |

---

# 9.2 Difficulty Scaling

Increasing difficulty impacts:

- Tile count
- Solve complexity
- Hint limitations
- Reward multipliers
- XP gains

---

# 10. Puzzle Image System

# 10.1 Puzzle Content

Images include:
- Trophy lifts
- Crowd celebrations
- Player reactions
- Stadium moments
- Dressing room celebrations

---

# 10.2 Admin Image Upload

Admins can:
- Upload images
- Activate/deactivate puzzles
- Assign difficulties
- Schedule limited-time puzzles

---

# 11. Timer + Score System

# 11.1 Timer Rules

Timer:
- Starts on first tile movement
- Stops on completion
- Uses millisecond precision

---

# 11.2 Stored Metrics

Track:
- Completion time
- Move count
- Hint usage
- Retry count
- Difficulty level

---

# 11.3 Score Calculation

Scores based on:
- Completion speed
- Difficulty multiplier
- Hint penalties
- Move efficiency

---

# 12. Leaderboard System

# 12.1 Leaderboard Types

| Type | Description |
|---|---|
| Global | Fastest players overall |
| Daily | Daily rankings |
| Weekly | Weekly rankings |
| Puzzle-Specific | Rankings per puzzle |
| Difficulty-Based | Rankings by difficulty |

---

# 12.2 Realtime Updates

Using realtime synchronization:

```text
User completes puzzle
    ↓
Score validated
    ↓
Leaderboard updated
    ↓
Realtime event broadcast
    ↓
Connected users see changes instantly
```

---

# 12.3 Anti-Cheat Protection

Server validates:
- Impossible times
- Modified payloads
- Suspicious patterns
- Exploit attempts

Protection methods:
- Server-side validation
- Device signature checks
- Rate limiting
- Replay detection

---

# 13. Social Sharing System

# 13.1 Core Sharing Philosophy

Winning should feel share-worthy.

Every completed puzzle should generate:
- Excitement
- Competition
- Challenge invitations
- Viral moments

---

# 13.2 Share Destinations

Users can share directly to:
- X
- Instagram Stories
- WhatsApp
- Facebook
- TikTok

---

# 13.3 Share Card System

Dynamic share cards generated after completion.

Includes:
- Username
- Puzzle image
- Completion time
- Global rank
- Difficulty completed
- Arsenal-inspired visuals
- Challenge CTA

---

# 13.4 Challenge Sharing Flow

```text
User completes puzzle
    ↓
Victory screen displayed
    ↓
User taps share
    ↓
Challenge link generated
    ↓
Friends open same puzzle
    ↓
Friends attempt to beat score
```

---

# 13.5 Viral Growth System

Shared links should:
- Open directly into gameplay
- Preserve challenge context
- Display target score
- Encourage immediate participation

---

# 14. Reward System

# 14.1 Achievement System

Achievements include:
- First Win
- Top 100 Finish
- No Hint Completion
- Speed Demon
- Legendary Solver

---

# 14.2 XP System

XP awarded for:
- Completing puzzles
- Faster times
- Harder difficulties
- Daily streaks

---

# 14.3 Unlockables

Future unlockables:
- Exclusive celebration images
- Animated frames
- Badge collections
- Special themes

---

# 15. Animation System

Using Anime.js.

---

# 15.1 Animation Events

Animations triggered for:
- Tile snapping
- Puzzle completion
- Trophy reveals
- Leaderboard updates
- XP gain
- Achievement unlocks

---

# 15.2 Motion Direction

Animations should feel:
- Fast
- Energetic
- Celebratory
- Lightweight
- Football-inspired

---

# 16. Audio System (Optional MVP Enhancement)

## Sounds

- Tile placement
- Crowd cheers
- Trophy celebration
- Achievement unlock

---

# 17. Mobile UX Requirements

# 17.1 Mobile Priorities

The app must feel native-like.

Requirements:
- Thumb-friendly controls
- Responsive drag interactions
- Portrait-first layout
- Minimal UI clutter
- Fast transitions
- Gesture-safe interactions

---

# 17.2 Accessibility

Support:
- Large touch targets
- Reduced motion mode
- High contrast mode
- Keyboard support
- Screen reader labels

---

# 18. Admin Dashboard

# 18.1 Admin Features

Admins can:
- Upload puzzle images
- Configure stages
- Moderate leaderboards
- Ban cheaters
- View analytics
- Schedule puzzle drops

---

# 18.2 Admin Roles

| Role | Permissions |
|---|---|
| Super Admin | Full access |
| Content Admin | Puzzle management |
| Moderator | Leaderboard moderation |

---

# 19. Analytics System

# 19.1 Events Tracked

| Event | Purpose |
|---|---|
| puzzle_started | Engagement tracking |
| puzzle_completed | Retention tracking |
| share_clicked | Viral tracking |
| challenge_opened | Referral tracking |
| leaderboard_viewed | Competitive tracking |
| hints_used | Difficulty balancing |

---

# 19.2 KPI Metrics

Track:
- Daily active users
- Average session time
- Share conversion rate
- Puzzle completion rate
- Retention rate
- Replay frequency

---

# 20. Technical Stack

# 20.1 Frontend Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| UI | shadcn/ui |
| Styling | Tailwind CSS |
| Animation | Anime.js |
| State Management | Zustand |
| Drag Engine | dnd-kit |
| Data Fetching | TanStack Query |
| Validation | Zod |
| Type Safety | TypeScript |

---

# 20.2 Backend Stack

| Layer | Technology |
|---|---|
| Backend | Supabase |
| Database | PostgreSQL |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Functions | Supabase Edge Functions |

---

# 20.3 Infrastructure

| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Cloudflare | CDN + caching |
| Sentry | Error monitoring |
| PostHog | Product analytics |

---

# 21. System Architecture

```text
Client App (Next.js)
    |
    |-- Puzzle Engine
    |-- Leaderboard UI
    |-- Share System
    |-- Animation Layer
    |
API Layer
    |
    |-- Score Validation
    |-- Leaderboard Logic
    |-- Analytics
    |
Supabase Backend
    |
    |-- PostgreSQL
    |-- Realtime
    |-- Storage
    |-- Edge Functions
```

---

# 22. Database Design

# 22.1 users

| Field | Type |
|---|---|
| id | uuid |
| device_id | text |
| username | text |
| xp | integer |
| created_at | timestamp |

---

# 22.2 puzzles

| Field | Type |
|---|---|
| id | uuid |
| title | text |
| image_url | text |
| difficulty | text |
| tile_count | integer |
| active | boolean |

---

# 22.3 puzzle_attempts

| Field | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| puzzle_id | uuid |
| completion_time_ms | integer |
| move_count | integer |
| hints_used | integer |
| completed | boolean |

---

# 22.4 leaderboard_entries

| Field | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| puzzle_id | uuid |
| best_time_ms | integer |
| rank | integer |

---

# 23. Performance Requirements

# 23.1 Performance Targets

| Metric | Goal |
|---|---|
| First Load | Under 3s |
| Interaction Delay | Under 50ms |
| Drag FPS | 60 FPS |
| Lighthouse Mobile | 90+ |

---

# 23.2 Optimization Techniques

Frontend:
- Route splitting
- Dynamic imports
- Lazy loading
- GPU transforms
- Image prefetching

Backend:
- Edge caching
- Indexed queries
- CDN delivery
- Realtime throttling

---

# 24. Security Requirements

# 24.1 Security Measures

| Area | Protection |
|---|---|
| Leaderboards | Server validation |
| Sessions | Device signature validation |
| APIs | Rate limiting |
| Storage | Signed URLs |
| Gameplay | Anti-cheat detection |

---

# 25. MVP Scope

# Included

- Device-based identity
- Username creation
- Puzzle gameplay
- 6 difficulty stages
- Realtime leaderboards
- Social sharing
- Challenge links
- Share card generation
- Admin dashboard
- Mobile optimization
- Analytics
- Anti-cheat system

---

# Excluded

- Multiplayer races
- Voice chat
- AI puzzle generation
- User puzzle uploads
- Friend systems
- Tournaments
- AR gameplay

---

# 26. Future Roadmap

# Phase 2

- Multiplayer races
- Daily tournaments
- Seasonal puzzle events
- Team competitions

---

# Phase 3

- User-generated puzzles
- AI-generated moments
- AR puzzle mode
- Club expansion packs

---

# 27. Success Metrics

| Metric | Goal |
|---|---|
| Avg Session Time | 10+ mins |
| Puzzle Completion Rate | 70% |
| Returning Users | 40% |
| Share Conversion Rate | 25% |
| Leaderboard Participation | 60% |

---

# 28. Development Phases

# Phase 1

- App setup
- Puzzle engine
- Drag system
- Username system
- Device identity

---

# Phase 2

- Leaderboards
- Score validation
- Realtime sync
- Difficulty scaling

---

# Phase 3

- Social sharing
- Share card generation
- Challenge system
- Analytics

---

# Phase 4

- Optimization
- Accessibility
- QA testing
- Production deployment

---

# 29. Recommended UX Direction

The experience should feel closer to:
- TikTok
- Subway Surfers
- Wordle

Rather than:
- Complex gaming platforms
- Enterprise apps
- Competitive esports dashboards

The app should prioritize:
- Instant fun
- Fast gameplay
- Social bragging
- Repeat sessions

