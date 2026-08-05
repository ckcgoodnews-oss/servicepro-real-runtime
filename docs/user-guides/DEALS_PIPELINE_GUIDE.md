# Deals & Pipeline — User Guide

> **ServicePRO v8.0** | Last updated: August 4, 2026

![Deals Pipeline](./images/placeholder-deals-pipeline.png)

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Key Concepts](#key-concepts)
- [Step-by-Step Walkthrough](#step-by-step-walkthrough)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Overview

ServicePRO's deals pipeline bridges the gap between marketing leads and field service operations, providing complete revenue visibility from initial opportunity through work order completion and payment.

**Why Deals Matter for Aqua Pro Plumbing:** Track every revenue opportunity from Jennifer Martinez's $12,500 HVAC replacement inquiry through estimate, installation, payment, and future maintenance contract renewals.

> 💡 **Business Value:** Accurate revenue forecasting, sales performance tracking, and seamless integration between sales and operations teams.

---

## Quick Start

### Creating Your First Deal

1. **Navigate to CRM → Deals** in the ServicePRO interface
2. **Click "New Deal"** and enter basic information
3. **Link to existing contact** or create a new one during deal creation

**Essential Deal Information:**
- **Deal Name:** "HVAC System Replacement — Johnson Residence"  
- **Amount:** $12,500
- **Expected Close Date:** 2026-09-15
- **Pipeline Stage:** Qualified
- **Assigned Owner:** alice@aquapro.com

---

## Key Concepts

### Deals vs Estimates vs Work Orders

| Entity | Purpose | When to Use |
|--------|---------|-------------|
| **Deal** | Revenue opportunity tracking | Before quote is accepted |
| **Estimate** | Formal pricing proposal | When customer requests pricing |
| **Work Order** | Scheduled field service job | After customer accepts estimate |

### Pipeline Stages

ServicePRO includes these default stages with probability weightings:

1. **New** (10%) — Initial inquiry or referral
2. **Qualified** (25%) — Budget and need confirmed
3. **Proposal** (50%) — Estimate sent to customer  
4. **Negotiation** (75%) — Discussing terms, pricing, timeline
5. **Closed Won** (100%) — Contract signed, work order created
6. **Closed Lost** (0%) — Customer decided not to proceed

### Deal Health Indicators

- 🟢 **Healthy:** Active communication, progressing through stages
- 🟡 **At Risk:** Stalled in stage for 14+ days, no recent activity
- 🔴 **Lost:** Past expected close date with no communication

---

## Step-by-Step Walkthrough

### Creating Your First Deal

**Step 1: Basic Deal Information**

```http
POST /api/v1/deals
{
  "name": "HVAC System Replacement — Johnson Residence",
  "amount": 12500,
  "currency": "USD",
  "stage": "qualified",
  "status": "open",
  "expected_close_date": "2026-09-15",
  "pipeline_id": "default_pipeline",
  "owner_id": "alice@aquapro.com"
}
```

**Step 2: Link to Customer Contact**

Once the deal is created, link it to the customer contact:

```http
POST /api/v1/associations
{
  "source_type": "deal",
  "source_id": "deal_xyz789",
  "target_type": "contact", 
  "target_id": "contact_jennifer_martinez",
  "association_type": "primary_contact",
  "label": "Decision Maker"
}
```

**Step 3: Add Deal Products/Services**

Specify what services are included in this deal:

```http
POST /api/v1/deals/deal_xyz789/products
{
  "service_id": "hvac_replacement_premium",
  "quantity": 1,
  "unit_price": 10500,
  "description": "Carrier 3-ton high-efficiency heat pump system"
},
{
  "service_id": "ductwork_modification", 
  "quantity": 1,
  "unit_price": 2000,
  "description": "Ductwork modifications for new system"
}
```

### Moving Deals Through the Pipeline

**Stage Progression Example:**

1. **New → Qualified:** After initial customer call confirms budget and timeline
   ```http
   PATCH /api/v1/deals/deal_xyz789
   {
     "stage": "qualified",
     "notes": "Customer confirmed $15K budget for HVAC replacement"
   }
   ```

2. **Qualified → Proposal:** When estimate is sent
   ```http
   PATCH /api/v1/deals/deal_xyz789
   {
     "stage": "proposal",
     "notes": "Estimate #EST-2026-0423 sent for $12,500"
   }
   ```

3. **Proposal → Closed Won:** Customer accepts estimate
   ```http
   PATCH /api/v1/deals/deal_xyz789
   {
     "stage": "closed_won",
     "status": "won",
     "win_reason": "competitive_pricing",
     "notes": "Customer signed contract, work order WO-2026-1156 created"
   }
   ```

### Converting Deals to Operations

**Deal → Estimate Conversion:**

When a deal reaches "Proposal" stage, create an estimate:

```http
POST /api/v1/estimates
{
  "customer_id": "customer_martinez",
  "deal_id": "deal_xyz789",
  "services": [
    {
      "service_id": "hvac_replacement_premium",
      "quantity": 1,
      "unit_price": 10500
    }
  ],
  "total_amount": 12500,
  "notes": "Based on deal xyz789 - HVAC replacement"
}
```

**Estimate → Work Order Conversion:**

When customer accepts the estimate:

```http
POST /api/v1/jobs
{
  "customer_id": "customer_martinez",
  "estimate_id": "estimate_abc456",
  "deal_id": "deal_xyz789",
  "title": "HVAC System Replacement — Johnson Residence",
  "scheduled_date": "2026-09-20",
  "priority": "normal",
  "technician_id": "tech_bob_johnson"
}
```

---

## Configuration

### Setting Up Custom Pipelines

**Create Industry-Specific Pipeline:**

```http
POST /api/v1/deals/pipelines
{
  "name": "Emergency Service Pipeline",
  "description": "For urgent repair and replacement work",
  "stages": [
    { "name": "Emergency Call", "probability": 80 },
    { "name": "On-Site Assessment", "probability": 90 },
    { "name": "Approved", "probability": 100 },
    { "name": "Declined", "probability": 0 }
  ]
}
```

### Custom Deal Properties

Add fields specific to your business:

```http
POST /api/v1/crm/properties
{
  "object_type": "deal",
  "name": "equipment_age",
  "label": "Equipment Age (Years)",
  "type": "number",
  "required": false,
  "display_order": 10
}
```

### Lead Assignment Rules

Set up automated deal assignment:

```http
POST /api/v1/deals/assignment-rules
{
  "name": "Territory-Based Assignment",
  "criteria": {
    "property_state": "CA"
  },
  "assignment_type": "specific_user",
  "assigned_to": "alice@aquapro.com"
}
```

---

## API Reference

### Create Deal
**POST** `/api/v1/deals`

**Request:**
```json
{
  "name": "HVAC System Replacement — Johnson Residence",
  "amount": 12500,
  "stage": "qualified",
  "expected_close_date": "2026-09-15",
  "source": "referral",
  "contact_id": "contact_abc123"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "deal_xyz789",
    "name": "HVAC System Replacement — Johnson Residence",
    "amount": 12500,
    "stage": "qualified",
    "status": "open",
    "probability": 25,
    "expected_close_date": "2026-09-15",
    "created_at": "2026-08-04T15:30:00Z",
    "owner": {
      "id": "alice@aquapro.com",
      "name": "Alice Johnson"
    }
  }
}
```

### List Deals
**GET** `/api/v1/deals`

**Query Parameters:**
- `stage` — Filter by pipeline stage
- `owner` — Filter by assigned owner
- `status` — Filter by open/won/lost
- `pipeline_id` — Filter by specific pipeline

**Response (200):**
```json
{
  "data": [
    {
      "id": "deal_xyz789",
      "name": "HVAC System Replacement — Johnson Residence", 
      "amount": 12500,
      "stage": "qualified",
      "probability": 25,
      "expected_close_date": "2026-09-15",
      "owner": { "name": "Alice Johnson" },
      "contact": { "name": "Jennifer Martinez" }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 127
  }
}
```

### Pipeline Forecast
**GET** `/api/v1/deals/forecast`

**Response (200):**
```json
{
  "data": {
    "pipeline_summary": {
      "new": { "count": 23, "amount": 287500 },
      "qualified": { "count": 15, "amount": 425000 },
      "proposal": { "count": 8, "amount": 156000 },
      "negotiation": { "count": 3, "amount": 67500 }
    },
    "weighted_total": 284375,
    "expected_close_this_month": 125000,
    "expected_close_next_month": 89750
  }
}
```

---

## Best Practices

### Deal Naming Conventions

- **Include service type and location:** "HVAC Replacement — Main St Residence"
- **Be specific about scope:** "Emergency Water Heater Repair" vs "Service Call"
- **Include customer name for easy identification:** "Johnson — Quarterly HVAC Maintenance"

### Pipeline Management

- **Move deals regularly** — Update stages within 48 hours of status changes
- **Add meaningful notes** — Document customer conversations and next steps
- **Set realistic close dates** — Base on customer timeline, not sales goals
- **Review stalled deals weekly** — Follow up on opportunities stuck in stage 14+ days

### Deal Qualification

Before moving to "Qualified" stage, confirm:
- ✅ Customer has identified problem/need
- ✅ Budget range is appropriate for solution
- ✅ Timeline is realistic and agreed upon
- ✅ Decision-making process is understood

### Revenue Forecasting

- **Use stage probabilities consistently** — Don't override without good reason
- **Update amounts based on latest estimates** — Keep deal values current
- **Track win/loss reasons** — Learn from both successful and unsuccessful deals
- **Monitor conversion rates by stage** — Identify bottlenecks in your process

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Deal not showing in pipeline view | Check that deal status is "open" and stage matches pipeline |
| Unable to move deal to next stage | Verify user has `deals.write` permission |
| Forecast amounts seem incorrect | Ensure deal amounts are current and stage probabilities are accurate |
| Deal activity not appearing | Check that activity timeline permissions are granted |
| Cannot link deal to customer | Verify customer record exists and user has association permissions |

---

## FAQ

**Q: What's the difference between a deal and a lead?**
A: Leads are unqualified inquiries from marketing. Deals are qualified revenue opportunities with identified decision-makers, budgets, and timelines. Leads convert to deals when qualification criteria are met.

**Q: When should I create a deal vs just sending an estimate?**
A: Create a deal for any opportunity you want to track in your sales pipeline and forecast. For quick quotes on small repairs, you might skip the deal and go straight to estimate.

**Q: Can one customer have multiple deals?**
A: Yes. A customer might have separate deals for HVAC replacement (current) and plumbing upgrade (future). Each deal tracks a distinct revenue opportunity.

**Q: What happens to a deal when it becomes a work order?**
A: The deal stays in "Closed Won" status and links to the work order through the association system. This maintains the complete revenue trail from opportunity to payment.

**Q: How do I handle deals that span multiple properties?**
A: Create separate deals for each property, or use a single deal with line items specifying different service addresses. The association system can link one deal to multiple properties.

**Q: Can I customize the pipeline stages?**
A: Yes. Create custom pipelines with stages that match your sales process. Each pipeline can have different stages and probability weightings.

---

## Related Documentation

- [CRM Contacts Guide](./CONTACTS_CRM_GUIDE.md)
- [Unified Customer Record Architecture](../architecture/UNIFIED_CUSTOMER_OPERATIONAL_RECORD.md)
- [Sales Sequences & Meetings Guide](./SALES_SEQUENCES_MEETINGS_GUIDE.md)
- [ServicePRO API Reference](./API_REFERENCE_GUIDE.md)