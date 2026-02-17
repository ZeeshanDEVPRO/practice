> A backend for a mini learning platform where users:

* Log in
* Solve quizzes
* Earn points
* Appear on leaderboard
* Get rate-limited
* Receive real-time updates

No heavy UI required — API-first.

---

# 🎯 Core Learning Goals

This project forces you to use:

* Strings
* Hashes
* Lists
* Sets
* Sorted Sets
* TTL
* Atomic operations
* Lua scripting (optional but powerful)
* Pub/Sub or Streams
* Caching strategy
* Key design strategy

---

# 🧱 Architecture Requirements

Stack:

* Node + TypeScript (as you prefer)
* Express
* Redis
* No database initially (Redis-first mindset)

Later you may optionally integrate PostgreSQL.

---

# 🧩 Project Tasks (Follow in Order)

---

## 🔹 PHASE 1 — Redis Fundamentals Applied

### Task 1: Session Management

When a user logs in:

* Generate session token
* Store session in Redis
* Add TTL (e.g., 30 minutes)
* Auto-expire inactive users

You must:

* Design clean key naming
* Support session refresh

Concepts covered:
`SET`, `EX`, key design, TTL

---

### Task 2: Store User Profiles (Using Hash)

Store:

* userId
* username
* totalScore
* quizzesSolved

Use Redis Hash instead of JSON string.

You must:

* Increment score atomically
* Retrieve full profile efficiently

Concepts:
`HSET`, `HGETALL`, `HINCRBY`

---

## 🔹 PHASE 2 — Real Performance Patterns

### Task 3: Caching Expensive Quiz Results

Simulate:
`GET /quiz/:id/results`

Requirements:

* Cache response
* TTL 60 seconds
* Cache-aside strategy
* Invalidate cache when quiz is updated

You must:

* Handle cache invalidation correctly
* Prevent stale data

Concepts:
Cache pattern, TTL, key invalidation

---

## 🔹 PHASE 3 — Leaderboard System (Critical)

### Task 4: Global Leaderboard

Requirements:

* Rank users by score
* Get top 10 users
* Get specific user's rank
* Update score in real-time

Use:
Sorted Sets

Concepts:
`ZADD`, `ZINCRBY`, `ZRANGE`, `ZREVRANK`

This is production-grade Redis usage.

---

## 🔹 PHASE 4 — Rate Limiting

### Task 5: Protect Quiz Submission Endpoint

Rules:

* Max 5 submissions per minute per user
* After limit → block request

You must:

* Use atomic operations
* Avoid race conditions

Concepts:
`INCR`, `EXPIRE`
(or sliding window using Sorted Sets if ambitious)

---

## 🔹 PHASE 5 — Background Job Queue (Mini Version)

### Task 6: Async Score Processing

When user submits quiz:

* Push job into Redis List
* Worker consumes from list
* Worker updates score

Use:
`LPUSH`, `BRPOP`

Concept:
Message queue pattern using Redis Lists

---

## 🔹 PHASE 6 — Real-Time Notifications

### Task 7: Notify When Leaderboard Changes

When:

* User enters top 10

Then:

* Publish event

Use:
Pub/Sub

Concept:
Event-driven systems

---

## 🔹 PHASE 7 — Advanced (Optional but Strong)

### Task 8: Sliding Window Rate Limiter

Use:
Sorted Set with timestamps

Requirement:

* Accurate per-second rate limit
* Remove old timestamps
* Allow 5 requests per rolling 60 seconds

Concept:
Time-based data modeling in Redis

---

## 🔹 PHASE 8 — Data Expiry Strategy

### Task 9: Auto-clean Inactive Users

If:

* User inactive for 7 days

Then:

* Remove from leaderboard
* Remove session

Use:
TTL + periodic scan strategy

Concept:
Lifecycle management

---
