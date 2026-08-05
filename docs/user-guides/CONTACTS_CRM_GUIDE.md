# Contacts & CRM — User Guide

> **ServicePRO v8.0** | Last updated: August 4, 2026

![CRM Contacts](./images/placeholder-crm-contacts.png)

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Key Concepts](#key-concepts)
- [Step-by-Step Walkthrough](#step-by-Step-walkthrough)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Overview

ServicePRO's CRM system manages customer relationships from initial contact through ongoing service relationships. Track individuals (contacts) within organizations (companies), manage communication history, and coordinate between sales and field service teams.

**For Aqua Pro Plumbing:** Manage Jennifer Martinez (homeowner at 123 Main St) and Tom Wilson (facility manager for Wilson Manufacturing) with complete service history, equipment tracking, and future opportunity identification.

> 💡 **Business Value:** Complete customer intelligence, relationship tracking, and coordinated customer experience across sales, service, and support teams.

---

## Quick Start

### Creating Your First Contact

1. **Navigate to CRM → Contacts** in ServicePRO
2. **Click "New Contact"** 
3. **Enter contact information** and link to company if applicable

**Essential Contact Information:**
- **Name:** Jennifer Martinez
- **Email:** jennifer@email.com  
- **Phone:** (555) 123-4567
- **Company:** Martinez Residence (or link to existing company)
- **Address:** 123 Main St, Anytown, CA 91234
- **Lifecycle Stage:** Customer

---

## Key Concepts

### Contacts vs Companies vs Customers

| Entity | Purpose | Example |
|--------|---------|---------|
| **Contact** | Individual person | Jennifer Martinez |
| **Company** | Business/Organization | Martinez Residence, Wilson Manufacturing |
| **Customer** | Billing entity (legacy) | Transitioning to Contact+Company model |

### Contact Lifecycle Stages

```mermaid
graph LR
    A[Subscriber] --> B[Lead] --> C[MQL] --> D[SQL] --> E[Opportunity] --> F[Customer] --> G[Evangelist]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#e0f2f1
    style G fill:#f1f8e9
```

- **Subscriber** — Newsletter/content subscriber
- **Lead** — Identified prospect with contact information
- **MQL** — Marketing Qualified Lead (engaged with content)
- **SQL** — Sales Qualified Lead (budget, need, timeline identified)
- **Opportunity** — Active sales process/deal in progress
- **Customer** — Has purchased services
- **Evangelist** — Advocates and refers others

### Contact Sources

Track how contacts entered your system:
- **Website** — Contact form submission
- **Referral** — Existing customer referral
- **Marketing** — Campaign response
- **Trade Show** — Event lead capture
- **Cold Outreach** — Sales prospecting
- **Portal** — Customer portal registration

---

## Step-by-Step Walkthrough

### Creating Contacts

**Step 1: Basic Contact Creation**

```http
POST /api/v1/crm/contacts
{
  "first_name": "Jennifer",
  "last_name": "Martinez", 
  "email": "jennifer@email.com",
  "phone": "(555) 123-4567",
  "lifecycle_stage": "customer",
  "source": "referral",
  "properties": {
    "preferred_contact_method": "phone",
    "service_area": "residential"
  }
}
```

**Step 2: Link to Company**

```http
POST /api/v1/associations
{
  "source_type": "contact",
  "source_id": "contact_jennifer",
  "target_type": "company",
  "target_id": "company_martinez_residence",
  "association_type": "works_at",
  "label": "Homeowner"
}
```

**Step 3: Add Properties/Address**

```http
POST /api/v1/crm/contacts/contact_jennifer/properties
{
  "street_address": "123 Main St",
  "city": "Anytown", 
  "state": "CA",
  "zip_code": "91234",
  "property_type": "single_family_home",
  "home_size_sqft": 2400,
  "lot_size": "0.25 acres"
}
```

### Managing Contact Relationships

**Link Contact to Service Equipment:**

```http
POST /api/v1/associations  
{
  "source_type": "contact",
  "source_id": "contact_jennifer",
  "target_type": "equipment", 
  "target_id": "equipment_hvac_main_house",
  "association_type": "owns",
  "label": "Primary HVAC System"
}
```

**Track Communication History:**

```http
POST /api/v1/activity
{
  "entity_type": "contact",
  "entity_id": "contact_jennifer",
  "activity_type": "call",
  "title": "Follow-up call about HVAC maintenance",
  "description": "Discussed upcoming seasonal maintenance appointment. Customer confirmed availability for next Tuesday 10 AM.",
  "performed_by": "alice@aquapro.com"
}
```

### Lead to Customer Conversion

**Update Lifecycle Stage:**

```http
PATCH /api/v1/crm/contacts/contact_jennifer
{
  "lifecycle_stage": "customer", 
  "lifecycle_stage_changed_at": "2026-08-04T15:30:00Z",
  "properties": {
    "first_service_date": "2026-08-04",
    "customer_segment": "residential_premium"
  }
}
```

**Create Deal from Qualified Lead:**

```http
POST /api/v1/deals
{
  "name": "HVAC Maintenance Contract — Martinez Residence",
  "contact_id": "contact_jennifer",
  "amount": 480,
  "stage": "qualified",
  "expected_close_date": "2026-08-15"
}
```

### Managing B2B Relationships

**Create Business Contact:**

```http
POST /api/v1/crm/contacts
{
  "first_name": "Tom",
  "last_name": "Wilson",
  "email": "twilson@wilsonmfg.com",
  "phone": "(555) 987-6543",
  "job_title": "Facilities Manager",
  "lifecycle_stage": "customer"
}
```

**Link to Company:**

```http
POST /api/v1/associations
{
  "source_type": "contact", 
  "source_id": "contact_tom_wilson",
  "target_type": "company",
  "target_id": "company_wilson_manufacturing", 
  "association_type": "works_at",
  "label": "Facilities Manager",
  "is_primary": true
}
```

---

## Configuration

### Custom Contact Properties

**Add Industry-Specific Fields:**

```http
POST /api/v1/crm/properties
{
  "object_type": "contact",
  "name": "hvac_system_age", 
  "label": "HVAC System Age (Years)",
  "type": "number",
  "required": false,
  "display_order": 15,
  "property_group": "equipment_info"
}
```

**Property Groups for Organization:**

```http
POST /api/v1/crm/property-groups
{
  "object_type": "contact",
  "name": "equipment_info",
  "label": "Equipment Information", 
  "display_order": 2,
  "properties": [
    "hvac_system_age",
    "hvac_system_brand",
    "last_service_date",
    "service_contract_status"
  ]
}
```

### Lead Scoring Rules

**Implement Contact Scoring:**

```http
POST /api/v1/crm/scoring-rules
{
  "name": "Service Readiness Score",
  "object_type": "contact",
  "rules": [
    {
      "criteria": { "lifecycle_stage": "customer" },
      "points": 50
    },
    {
      "criteria": { "properties.hvac_system_age": { ">": 8 } },
      "points": 30
    },
    {
      "criteria": { "properties.last_service_date": { "<": "2025-01-01" } },
      "points": 25
    }
  ]
}
```

### Duplicate Detection Rules

**Prevent Duplicate Contacts:**

```http
POST /api/v1/crm/duplicate-rules
{
  "object_type": "contact",
  "name": "Email and Phone Matching",
  "match_criteria": [
    { "field": "email", "exact": true },
    { "field": "phone", "fuzzy": true }
  ],
  "action": "prevent_creation",
  "merge_suggestions": true
}
```

---

## API Reference

### Create Contact
**POST** `/api/v1/crm/contacts`

**Request:**
```json
{
  "first_name": "Jennifer",
  "last_name": "Martinez",
  "email": "jennifer@email.com", 
  "phone": "(555) 123-4567",
  "lifecycle_stage": "lead",
  "source": "website",
  "properties": {
    "property_type": "single_family_home",
    "preferred_contact_time": "evening"
  }
}
```

**Response (201):**
```json
{
  "data": {
    "id": "contact_jennifer",
    "first_name": "Jennifer",
    "last_name": "Martinez", 
    "email": "jennifer@email.com",
    "phone": "(555) 123-4567",
    "lifecycle_stage": "lead",
    "source": "website",
    "score": 25,
    "created_at": "2026-08-04T15:30:00Z",
    "properties": {
      "property_type": "single_family_home",
      "preferred_contact_time": "evening"
    }
  }
}
```

### Search Contacts
**GET** `/api/v1/crm/contacts/search`

**Query Parameters:**
- `q` — Search name, email, phone, company
- `lifecycle_stage` — Filter by stage
- `source` — Filter by lead source
- `score_min` — Minimum lead score
- `created_after` — Date filter

**Response (200):**
```json
{
  "data": [
    {
      "id": "contact_jennifer",
      "name": "Jennifer Martinez",
      "email": "jennifer@email.com",
      "lifecycle_stage": "customer", 
      "score": 85,
      "last_contact": "2026-08-01T14:22:00Z",
      "company": { "name": "Martinez Residence" }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0, 
    "total": 1247
  }
}
```

### Contact Activity Timeline
**GET** `/api/v1/crm/contacts/:id/timeline`

**Response (200):**
```json
{
  "data": [
    {
      "type": "call",
      "title": "Follow-up call completed",
      "description": "Discussed HVAC maintenance needs",
      "performed_by": "Alice Johnson",
      "performed_at": "2026-08-04T10:15:00Z"
    },
    {
      "type": "deal_created",
      "title": "Deal created: HVAC Maintenance Contract",
      "description": "$480 annual maintenance agreement",
      "performed_at": "2026-08-04T09:30:00Z"
    },
    {
      "type": "lifecycle_stage_changed",
      "title": "Moved to Customer stage",
      "description": "First service completed successfully", 
      "performed_at": "2026-08-03T16:45:00Z"
    }
  ]
}
```

---

## Best Practices

### Data Quality

- **Use consistent naming** — "Jennifer Martinez" not "Jen Martinez" or "J. Martinez"
- **Validate email addresses** — Check format and deliverability on entry
- **Standardize phone numbers** — Use consistent format: (555) 123-4567
- **Clean data regularly** — Remove bounced emails, update phone numbers

### Lifecycle Management

- **Update stages promptly** — Change lifecycle stage when customer status changes
- **Track stage progression** — Monitor how contacts move through your funnel
- **Automate stage changes** — Use workflow rules for consistent stage management
- **Score contacts regularly** — Update lead scores based on activity and properties

### Relationship Mapping

- **Link contacts to companies** — Understand organizational relationships
- **Associate with equipment** — Connect contacts to service equipment
- **Track decision makers** — Identify who makes service and purchasing decisions
- **Map influencers** — Note who influences buying decisions

### Communication Tracking

- **Log all significant interactions** — Calls, emails, meetings, service visits
- **Use consistent activity types** — Standardize how communications are categorized
- **Include relevant details** — Capture enough context for future reference
- **Set follow-up reminders** — Use tasks to ensure timely follow-up

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Duplicate contacts being created | Configure duplicate detection rules with email/phone matching |
| Contact not showing in search | Check lifecycle stage filters and search index refresh |
| Unable to link to company | Verify company record exists and user has association permissions |
| Custom properties not appearing | Check property group configuration and user role permissions |
| Lead scoring not updating | Review scoring rules and ensure automation triggers are active |

---

## FAQ

**Q: What's the difference between a contact and the existing customer records?**
A: Contacts are individual people, while the existing customer records serve as billing entities. We're transitioning to a contact+company model for better relationship tracking.

**Q: Can one person be associated with multiple companies?**  
A: Yes. A contact can work for multiple companies or have relationships with different organizations (contractor, consultant, board member).

**Q: How do I handle household contacts vs business contacts?**
A: Use the company association type: "homeowner" for residential, "employee" for business. Set up different property groups for each contact type.

**Q: When should I create a new company vs use existing?**
A: Create new companies for distinct organizations. For residential customers, each household is typically a separate "company" record.

**Q: How do I merge duplicate contacts?**
A: Use the duplicate detection suggestions or manually merge through the contact management interface. All associations and activity history will be preserved.

**Q: Can I import contacts from other systems?**
A: Yes, use the bulk import API with CSV data. Include duplicate detection to prevent creating duplicates during import.

**Q: How do I track family members at the same address?**
A: Create separate contact records for each person but associate them with the same company (household). Use association labels like "spouse", "child", etc.

---

## Related Documentation

- [Deals & Pipeline Guide](./DEALS_PIPELINE_GUIDE.md)
- [Unified Customer Record Architecture](../architecture/UNIFIED_CUSTOMER_OPERATIONAL_RECORD.md)
- [Marketing Segments & Forms Guide](./MARKETING_SEGMENTS_FORMS_GUIDE.md) 
- [CRM & Revenue Operations Architecture](../architecture/CRM_REVENUE_OPERATIONS.md)