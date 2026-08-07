"""Email templates for B2B outreach campaigns."""

# ServicePro trial invitation template
SERVICEPRO_TRIAL_INVITE_SUBJECT = "Free tool for $company_name — manage jobs, invoices & scheduling"

SERVICEPRO_TRIAL_INVITE_BODY = """
<p>Hi there,</p>

<p>I noticed <strong>$company_name</strong> provides $service_category services in $state.
I wanted to introduce <strong>ServicePro</strong> — a platform built specifically for
service businesses like yours.</p>

<p>Here's what it does:</p>
<ul>
    <li>Schedule and dispatch jobs to your crew</li>
    <li>Send professional estimates and invoices</li>
    <li>Let customers book online through your own website</li>
    <li>Track work orders from request to completion</li>
    <li>Get a professional business website in minutes</li>
</ul>

<p><strong>It's free to try for 14 days — no credit card needed.</strong></p>

<p><a href="https://app.aardvark-enterprises.net/start-free?source=outreach&industry=$service_category"
   style="display:inline-block;padding:12px 24px;background:#1c7c68;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">
   Start your free trial
</a></p>

<p>If you have any questions, just reply to this email — I'm happy to help.</p>

<p>Best,<br>
$sender_name<br>
$sender_company</p>
"""

# Simpler follow-up for non-responders (send 5-7 days after first)
SERVICEPRO_FOLLOWUP_SUBJECT = "Quick question for $company_name"

SERVICEPRO_FOLLOWUP_BODY = """
<p>Hi,</p>

<p>I reached out last week about ServicePro for $company_name.
Just checking if you had a chance to look at it.</p>

<p>A few $service_category businesses in $state are already using it to
save time on scheduling, invoicing, and customer communication.</p>

<p><a href="https://app.aardvark-enterprises.net/start-free?source=followup&industry=$service_category"
   style="display:inline-block;padding:10px 20px;background:#1c7c68;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">
   Try it free →
</a></p>

<p>No worries if it's not a fit — I won't follow up again unless you reply.</p>

<p>$sender_name</p>
"""
