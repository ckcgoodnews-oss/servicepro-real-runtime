# Sales Sequences & Meeting Scheduler — User Guide

> ServicePRO v8.0 | Last updated: 2026-08-04

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Key Concepts](#key-concepts)
- [Sales Sequences](#sales-sequences)
  - [Creating a Sequence](#creating-a-sequence)
  - [Enrolling Contacts](#enrolling-contacts)
  - [Managing Enrollments](#managing-enrollments)
  - [Sequence Analytics](#sequence-analytics)
- [Meeting Scheduler](#meeting-scheduler)
  - [Creating a Booking Page](#creating-a-booking-page)
  - [Sharing Your Booking Link](#sharing-your-booking-link)
  - [Managing Bookings](#managing-bookings)
- [Call Logging](#call-logging)
  - [Logging a Call](#logging-a-call)
  - [Call Statistics](#call-statistics)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Overview

Sales Sequences and the Meeting Scheduler help your team systematically engage leads and close deals faster. Instead of manually remembering to follow up, sequences automate multi-step outreach while the meeting scheduler eliminates back-and-forth scheduling emails.

**Why this matters for field service companies:**
- Leads requesting quotes often go cold if you don't follow up within 48 hours
- Technician availability for site surveys needs a booking system customers can self-serve
- Call logging captures the context that turns a phone inquiry into a signed work order

---

## Quick Start

1. **Create a sequence** — Go to `/sequences`, build a 3-step outreach (email → wait 2 days → call task → wait 3 days → follow-up email)
2. **Set up a booking page** — Go to `/meetings`, create a "Free Estimate Consultation" page with your availability
3. **Enroll a lead** — When a new lead comes in, enroll them in your sequence — it handles the rest

---

## Key Concepts

| Term | Definition |
|------|-----------|
| **Sequence** | A multi-step automated outreach plan combining emails, tasks, and delays |
| **Enrollment** | A contact actively moving through a sequence's steps |
| **Booking Page** | A public-facing scheduling link where prospects pick a time slot |
| **Step** | One action in a sequence (send email, create task, wait) |
| **Auto-unenroll** | Automatically removes contacts from a sequence when they reply or book a meeting |

---

## Sales Sequences

### Creating a Sequence

> 📋 **Example:** Aqua Pro Plumbing creates a "New Quote Follow-Up" sequence for leads who requested an estimate but haven't responded.

A sequence consists of ordered steps with delays between them:

```
Step 1 (Day 0): Email — "Your quote is ready"
Step 2 (Day 2): Task — Call to discuss quote
Step 3 (Day 5): Email — "Any questions about your estimate?"
Step 4 (Day 10): Task — Final follow-up call
```

**To create:**

```json
POST /api/v1/sequences

{
  "name": "Quote Follow-Up",
  "steps": [
    { "order": 0, "type": "email", "delay_days": 0, "subject": "Your estimate from Aqua Pro", "content": "Hi {{first_name}}, your estimate is ready..." },
    { "order": 1, "type": "task", "delay_days": 2, "task_type": "call" },
    { "order": 2, "type": "email", "delay_days": 5, "subject": "Following up on your estimate" },
    { "order": 3, "type": "task", "delay_days": 10, "task_type": "call" }
  ],
  "settings": {
    "daily_send_limit": 50,
    "stop_on_reply": true,
    "stop_on_meeting": true
  }
}
```

### Enrolling Contacts

Once a sequence exists, enroll contacts to start them at step 1:

```json
POST /api/v1/sequences/{sequence_id}/enroll

{
  "contact_id": "contact_abc123"
}
```

> 💡 **Tip:** Contacts won't be double-enrolled. If they're already active in the sequence, the API returns the existing enrollment.

### Managing Enrollments

| Action | Endpoint | When to use |
|--------|----------|------------|
| List enrollments | `GET /api/v1/sequences/{id}/enrollments` | See who's active |
| Unenroll manually | `POST /api/v1/sequences/enrollments/{id}/unenroll` | Contact asked to stop |
| Mark as replied | Internal — auto-detected | Contact responded |

### Sequence Analytics

Each sequence tracks:
- **Enrolled count** — Total contacts that entered
- **Completed count** — Contacts who reached the final step
- **Reply count** — Contacts who replied (auto-unenrolled)

---

## Meeting Scheduler

### Creating a Booking Page

> 📋 **Example:** A sales rep at Aqua Pro creates a "30-Minute Site Survey" booking page so homeowners can self-schedule the initial assessment.

```json
POST /api/v1/meetings/pages

{
  "name": "Free Estimate Consultation",
  "owner_id": "rep-001",
  "duration_minutes": 30,
  "buffer_minutes": 15,
  "location": "phone",
  "timezone": "America/New_York",
  "availability": {
    "monday": [{ "start": "09:00", "end": "17:00" }],
    "tuesday": [{ "start": "09:00", "end": "17:00" }],
    "wednesday": [{ "start": "09:00", "end": "17:00" }],
    "thursday": [{ "start": "09:00", "end": "17:00" }],
    "friday": [{ "start": "09:00", "end": "12:00" }]
  },
  "questions": [
    { "label": "What service do you need?", "type": "text", "required": true },
    { "label": "Preferred budget range", "type": "select", "options": ["Under $1,000", "$1,000–$5,000", "$5,000+"] }
  ],
  "settings": {
    "confirmation_email": true,
    "reminder_minutes": 60,
    "max_per_day": 6
  }
}
```

### Sharing Your Booking Link

Once created, the booking page has a unique slug. Share the link with prospects:
```
https://app.aardvark-enterprises.net/book/{slug}
```

### Managing Bookings

| Action | Endpoint |
|--------|----------|
| List all bookings | `GET /api/v1/meetings/bookings` |
| Book a time | `POST /api/v1/meetings/pages/{id}/book` |
| Cancel | `PATCH /api/v1/meetings/bookings/{id}` with `{"status": "cancelled"}` |
| Reschedule | `PATCH /api/v1/meetings/bookings/{id}` with new `start_time`/`end_time` |
| Record outcome | `PATCH /api/v1/meetings/bookings/{id}` with `{"outcome": "Signed contract"}` |

---

## Call Logging

### Logging a Call

After every sales call, log it so the team has full context:

```json
POST /api/v1/calls

{
  "caller_id": "rep-001",
  "contact_id": "contact_abc123",
  "deal_id": "deal_xyz789",
  "direction": "outbound",
  "outcome": "connected",
  "duration_seconds": 420,
  "notes": "Discussed HVAC options. Customer wants a 3-ton unit. Sending revised estimate tomorrow.",
  "recording_consent": true
}
```

**Outcome options:** `connected`, `no_answer`, `voicemail`, `busy`, `wrong_number`

### Call Statistics

Get performance metrics for your team:

```json
GET /api/v1/calls/stats?caller_id=rep-001
```

**Response:**
```json
{
  "data": {
    "total": 47,
    "connected": 31,
    "connect_rate": 66.0,
    "total_duration_seconds": 18420,
    "avg_duration_seconds": 392,
    "byOutcome": { "connected": 31, "no_answer": 10, "voicemail": 4, "busy": 2 }
  }
}
```

---

## API Reference

### Sequences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sequences` | List all sequences |
| POST | `/api/v1/sequences` | Create a sequence |
| GET | `/api/v1/sequences/{id}` | Get sequence detail |
| PATCH | `/api/v1/sequences/{id}` | Update sequence |
| DELETE | `/api/v1/sequences/{id}` | Delete sequence |
| POST | `/api/v1/sequences/{id}/enroll` | Enroll a contact |
| GET | `/api/v1/sequences/{id}/enrollments` | List enrollments |
| POST | `/api/v1/sequences/enrollments/{id}/unenroll` | Unenroll |

### Meetings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings/pages` | List booking pages |
| POST | `/api/v1/meetings/pages` | Create booking page |
| GET | `/api/v1/meetings/pages/{id}` | Get page detail |
| PATCH | `/api/v1/meetings/pages/{id}` | Update page |
| DELETE | `/api/v1/meetings/pages/{id}` | Delete page |
| GET | `/api/v1/meetings/bookings` | List bookings |
| POST | `/api/v1/meetings/pages/{id}/book` | Create booking |
| PATCH | `/api/v1/meetings/bookings/{id}` | Update/cancel booking |

### Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/calls` | List call logs |
| POST | `/api/v1/calls` | Log a call |
| GET | `/api/v1/calls/{id}` | Get call detail |
| PATCH | `/api/v1/calls/{id}` | Update call notes/outcome |
| GET | `/api/v1/calls/stats` | Aggregate call statistics |

---

## Best Practices

- **Keep sequences short** — 3–5 steps max. Longer sequences see declining engagement.
- **Set stop_on_reply: true** — Always respect when a prospect responds. No one wants automated emails after they've already replied.
- **Log every call** — Even 30-second voicemails. The pattern data helps you identify best times to call.
- **Add buffer time** to booking pages — 15 minutes between meetings prevents back-to-back stress and gives travel time for site visits.
- **Link calls to deals** — Always include `deal_id` when logging calls so the activity shows on the deal timeline.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Contact not enrolling | Check if they're already active in the sequence (no double-enrollment) |
| Booking page not showing slots | Verify availability settings include current day; check timezone |
| Sequence stuck on a step | Enrollment may need manual `advanceStep` — check `next_step_at` timestamp |
| Call stats showing 0 | Ensure `caller_id` matches the user ID you're filtering by |

---

## FAQ

**Q: Can a contact be in multiple sequences at once?**
A: Yes, as long as they're different sequences. A contact can only have one active enrollment per sequence.

**Q: What happens when a sequence ends?**
A: The enrollment status changes to `completed` and `completedAt` is set. The contact is no longer receiving automated steps.

**Q: Can customers book meetings without logging in?**
A: The booking endpoint is authenticated in the current implementation. For public booking pages, you'd expose the booking page via the public storefront routes.

**Q: Are calls actually placed through ServicePRO?**
A: ServicePRO logs calls — it doesn't place them. Integration with VoIP providers (Twilio, etc.) would handle the actual call connection. The call log captures what happened after the fact.

**Q: Is there a daily limit on sequence emails?**
A: Yes — controlled by `settings.daily_send_limit` (default: 50). This prevents being flagged as spam and keeps delivery rates high.
