// ServicePro Documentation & Learning Center - Complete Content Library
// 16 Volumes covering every role and feature

export type Chapter = {
  id: string;
  title: string;
  summary: string;
  content: string;
  readMinutes: number;
  steps?: string[];
  tips?: string[];
  troubleshooting?: string[];
  relatedChapters?: string[];
};

export type Volume = {
  id: string;
  volumeNumber: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  roles: string[];
  estimatedMinutes: number;
  chapters: Chapter[];
};

export const volumes: Volume[] = [
  // ============================================================
  // Volume 1: Getting Started
  // ============================================================
  {
    id: 'vol-getting-started',
    volumeNumber: 1,
    title: 'Getting Started Guide',
    description: 'Your first steps with ServicePro. Account activation, initial setup, and platform orientation for all users.',
    icon: '🚀',
    color: '#1a73e8',
    roles: ['customer', 'technician', 'dispatcher', 'office', 'manager', 'admin'],
    estimatedMinutes: 25,
    chapters: [
      {
        id: 'gs-what-is-servicepro',
        title: 'What is ServicePro?',
        summary: 'An overview of the platform and what it does for service businesses.',
        readMinutes: 3,
        content: `ServicePro is an all-in-one operating platform designed for service businesses such as plumbing, HVAC, electrical, pest control, landscaping, cleaning, and other field service trades.

It combines everything a service company needs into one system:

• A professional website to attract new customers
• A customer portal where clients book services and pay invoices
• A dispatch board to assign technicians to jobs
• Work order management from creation to completion
• Invoicing, payments, and financial tracking
• Inventory and parts management
• A CRM to track leads and grow the business
• AI-powered assistance and knowledge base
• Marketing tools for email campaigns and reviews
• Comprehensive reporting and analytics

Instead of using 5-10 different tools, ServicePro provides everything from a single login. Your team uses it daily to run the business, your customers use it to schedule service and pay bills, and you use it to track performance and grow revenue.`,
        tips: [
          'Bookmark the login page for quick access',
          'Your company URL will look like: yourcompany.servicepro.app',
          'Everything syncs in real-time — no need to refresh pages',
          'The platform works on phones, tablets, and computers'
        ]
      },
      {
        id: 'gs-account-activation',
        title: 'Activating Your Account',
        summary: 'How to activate your account the first time you receive login credentials.',
        readMinutes: 4,
        content: `When your administrator creates your account, you will receive an email with login instructions.

WHAT YOU WILL RECEIVE:
• An email from ServicePro (check spam/junk if not in inbox)
• Your temporary password or activation link
• The URL to access the platform

FIRST LOGIN:
The first time you sign in, you may be asked to change your temporary password. Choose a strong password that is at least 12 characters long and includes letters, numbers, and symbols.

MULTI-FACTOR AUTHENTICATION (MFA):
If your company requires MFA, you will be prompted to set up a second verification method. This is typically an authenticator app on your phone (like Google Authenticator or Authy). Scan the QR code shown on screen with your authenticator app.

IMPORTANT: If your activation link has expired, contact your administrator to request a new one. Do not share your activation link or credentials with anyone.`,
        steps: [
          'Check your email for the ServicePro activation message',
          'Click the activation link or navigate to the login URL',
          'Enter the email address and temporary password provided',
          'Create a new secure password (12+ characters, mix of letters/numbers/symbols)',
          'If prompted, set up multi-factor authentication by scanning the QR code',
          'Complete the setup wizard to configure your profile',
          'You are now logged in and ready to use ServicePro'
        ],
        tips: [
          'Check your spam/junk folder if you cannot find the activation email',
          'Write down your backup codes in a secure place in case you lose your phone',
          'Use a password manager to store your credentials safely',
          'If MFA is required, keep your authenticator app updated'
        ],
        troubleshooting: [
          'Activation link expired: Contact your administrator for a new invitation',
          'Email not received: Check spam folder, verify the email address with your admin',
          'Password rejected: Ensure it meets minimum requirements (12+ chars, mixed types)',
          'MFA code not working: Ensure your phone clock is synchronized (Settings > Date/Time > Auto)',
          'Locked out: Wait 15 minutes or contact your administrator to unlock'
        ]
      },
      {
        id: 'gs-navigation',
        title: 'Navigating the Platform',
        summary: 'Understanding the layout, sidebar, top bar, and how to find features.',
        readMinutes: 4,
        content: `ServicePro has a consistent layout across all pages:

THE SIDEBAR (Left Side):
The navigation sidebar shows all available modules. What you see depends on your role:
• Platform Admins see everything including system administration
• Company Admins see all company features
• Managers see operations, reports, and team management
• Technicians see their jobs, schedule, and field tools
• Office staff see CRM, billing, and scheduling

If a menu item is missing, your role may not include that module. Ask your administrator.

THE TOP BAR:
• Company name and logo (top left)
• Search bar — search anything: customers, jobs, invoices, etc.
• Notifications bell — unread alerts and updates
• Your profile icon (top right) — settings, logout

THE MAIN CONTENT AREA:
Each page follows this pattern:
1. Page title and description at the top
2. Key metrics/KPIs as cards
3. Action buttons (Create, Filter, Export)
4. Data table or content area
5. Pagination at the bottom for large lists

KEYBOARD SHORTCUTS:
• Ctrl+K or Cmd+K: Open search
• Ctrl+N: Create new (context-dependent)
• Escape: Close dialogs
• ?: Show all keyboard shortcuts`,
        steps: [
          'After login, you land on the Dashboard — your home screen',
          'The sidebar on the left shows your available modules',
          'Click any module name to open that section',
          'Use the search bar (top) to find anything quickly',
          'Check the notification bell for new alerts',
          'Click your profile icon (top right) for settings and logout'
        ],
        tips: [
          'The sidebar can be collapsed on mobile by tapping the hamburger menu',
          'Use keyboard shortcut Ctrl+K for instant search from any page',
          'Starred/favorited items appear at the top of the sidebar',
          'Right-clicking items often shows a context menu with quick actions'
        ]
      },
      {
        id: 'gs-dashboard',
        title: 'Understanding Your Dashboard',
        summary: 'What the dashboard shows and how to use it as your daily command center.',
        readMinutes: 3,
        content: `The Dashboard is the first screen you see after login. It shows a personalized overview based on your role:

FOR TECHNICIANS:
• Today's assigned jobs with addresses and times
• Your schedule for the week
• Unread messages from customers or dispatch
• Quick clock-in/clock-out button

FOR DISPATCHERS:
• Unassigned jobs requiring attention
• Technician availability status
• Today's schedule overview
• Capacity utilization

FOR OFFICE STAFF:
• Open invoices and payment status
• Recent customer inquiries
• Upcoming appointments
• Outstanding estimates awaiting approval

FOR MANAGERS:
• Revenue KPIs (today, week, month)
• Team performance metrics
• Job completion rates
• Customer satisfaction scores

FOR ADMINS:
• All of the above plus system health
• User activity and login stats
• Feature usage analytics
• Recent audit events

The dashboard refreshes automatically. You can also click any KPI card to drill into the detailed view.`,
        tips: [
          'Check your dashboard first thing each morning for priorities',
          'Click any metric card to see the full detail page',
          'The dashboard updates in real-time — no need to refresh',
          'You can customize which widgets appear (coming soon)'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 2: Customer Portal Guide
  // ============================================================
  {
    id: 'vol-customer-portal',
    volumeNumber: 2,
    title: 'Customer Portal Guide',
    description: 'For homeowners and business customers. Schedule services, view invoices, make payments, track equipment, and communicate with your service provider.',
    icon: '🏠',
    color: '#34a853',
    roles: ['customer'],
    estimatedMinutes: 30,
    chapters: [
      {
        id: 'cp-login',
        title: 'Logging Into the Customer Portal',
        summary: 'How to access your customer account and what to do if you forgot your password.',
        readMinutes: 3,
        content: `Your service provider has set up a Customer Portal for you. This is a private website where you can manage everything related to your service account.

HOW TO ACCESS:
Your service provider will send you an email with your portal login credentials. Click the link in that email or go directly to the portal URL (ask your service provider for the address).

SIGNING IN:
1. Enter your email address
2. Enter your password
3. Click "Sign In"

If this is your first time, you may need to create a password using the link in your welcome email.

FORGOT PASSWORD:
Click "Forgot password?" on the login page. Enter your email address and you will receive a reset link within a few minutes. Check your spam folder if you don't see it.`,
        steps: [
          'Open your web browser (Chrome, Safari, Firefox, or Edge)',
          'Go to the Customer Portal URL (from your welcome email)',
          'Enter your email address in the Email field',
          'Enter your password in the Password field',
          'Click the "Sign In" button',
          'You will be taken to your Dashboard'
        ],
        tips: [
          'Bookmark the portal URL for easy access next time',
          'Use a password manager to remember your credentials',
          'The portal works on your phone too — just open it in your mobile browser',
          'You stay logged in for 24 hours unless you click Sign Out'
        ],
        troubleshooting: [
          'Cannot find welcome email: Check spam/junk folder, or contact your service provider',
          'Password not working: Use "Forgot password?" to reset it',
          'Account locked: Wait 15 minutes, or contact your service provider',
          'Page not loading: Try a different browser or clear your cache'
        ]
      },
      {
        id: 'cp-dashboard',
        title: 'Your Dashboard',
        summary: 'Understanding what you see when you first log in.',
        readMinutes: 3,
        content: `When you log in, you see your Dashboard. This is your account overview showing the most important information at a glance.

WHAT YOU WILL SEE:

Next Appointment: Your next scheduled service visit. If none is scheduled, it will say "No upcoming" with a link to schedule one.

Open Invoices: How many unpaid invoices you have. Click to see details and make payments.

Pending Estimates: Proposals from your service provider waiting for your approval. Click to review and approve or decline.

Unread Messages: New messages from your service team. Click to read and reply.

QUICK ACTIONS:
At the bottom of the dashboard you will see buttons:
• "Book Appointment" — schedule a new service visit
• "Contact Support" — reach your service team directly

RECENT ACTIVITY:
Below the main cards, you can see your most recent account activity — completed services, payments made, estimates received, etc.`,
        steps: [
          'Log in to see your Dashboard automatically',
          'Review the four summary cards at the top',
          'Click any card to go to that section for more details',
          'Use the quick action buttons for common tasks',
          'Scroll down to see recent activity'
        ],
        tips: [
          'Check your dashboard weekly to stay on top of invoices and appointments',
          'The "Open Invoices" number turns red if anything is overdue',
          'You can always return to the dashboard by clicking "Dashboard" in the menu'
        ]
      },
      {
        id: 'cp-appointments',
        title: 'Scheduling & Managing Appointments',
        summary: 'How to book, reschedule, and cancel service appointments.',
        readMinutes: 5,
        content: `The Appointments page lets you request new service visits and view all past and upcoming appointments.

BOOKING A NEW APPOINTMENT:
1. Click "Book New Appointment" at the top of the page
2. Select the type of service you need (e.g., "AC Maintenance", "Plumbing Repair")
3. Choose your preferred date and time window
4. Add any notes about the issue (e.g., "Leak under kitchen sink, started yesterday")
5. Click "Submit Request"

IMPORTANT: Submitting a request does not guarantee that exact time. Your service provider will confirm the appointment and may suggest alternative times.

VIEWING UPCOMING APPOINTMENTS:
The "Upcoming" section shows all confirmed future appointments with:
• Date and time window
• Service type
• Assigned technician name (once confirmed)
• Status (Requested, Confirmed, En Route, In Progress)

VIEWING PAST APPOINTMENTS:
Scroll down to "Past Appointments" to see completed service visits with:
• Date completed
• Service performed
• Technician who handled it
• Any notes or recommendations made

RESCHEDULING OR CANCELING:
For confirmed appointments, click the appointment then select "Request Reschedule" or "Cancel." Cancellations within 24 hours of the scheduled time may be subject to fees per your service agreement.`,
        steps: [
          'Click "Appointments" in the left sidebar menu',
          'Click "Book New Appointment" (blue button at top)',
          'Select the service type from the dropdown list',
          'Pick your preferred date using the calendar',
          'Select a time window (Morning, Afternoon, or specific time)',
          'Add notes describing the issue or request',
          'Click "Submit Request"',
          'Wait for confirmation (you will receive an email/notification)'
        ],
        tips: [
          'Be specific in your notes — "hot water not working in master bath" is better than "plumbing issue"',
          'Morning appointments (8-10 AM) typically have the highest availability',
          'You can book multiple services for the same visit to save time',
          'Emergency services are available 24/7 — use "Contact Support" for urgent issues'
        ],
        troubleshooting: [
          'No available times showing: Your provider may be fully booked. Try a different date or call directly.',
          'Appointment not confirmed after 24 hours: Contact your service provider by phone.',
          'Need to change appointment: Click the appointment and select "Request Reschedule".',
          'Emergency outside business hours: Call the emergency number listed on the Support page.'
        ]
      },
      {
        id: 'cp-invoices',
        title: 'Viewing and Paying Invoices',
        summary: 'How to view your bills, understand charges, and make payments online.',
        readMinutes: 5,
        content: `The Invoices & Payments page shows all your bills and lets you pay them online.

UNDERSTANDING YOUR INVOICES:
Each invoice shows:
• Invoice number (e.g., INV-1042)
• Date issued
• Amount due
• Due date
• Status: Pending (not yet due), Overdue (past due date), Paid (completed)

VIEWING INVOICE DETAILS:
Click any invoice to see the full breakdown:
• Line items (labor, parts, materials)
• Quantities and unit prices
• Tax calculations
• Total amount due
• Payment terms

MAKING A PAYMENT:
1. Click "Pay Now" on any unpaid invoice
2. Enter your payment method (credit card, debit card, or bank transfer)
3. Confirm the amount (you can pay the full amount or a partial payment)
4. Click "Submit Payment"
5. You will receive a payment confirmation email

PAYMENT METHODS:
• Credit/Debit Card (Visa, Mastercard, American Express)
• Bank Transfer (ACH)
• The specific methods available depend on your service provider's setup

AUTOMATIC PAYMENTS:
If offered by your service provider, you can set up autopay to automatically charge your card when invoices are issued.

DOWNLOADING RECEIPTS:
After payment, click "Download Receipt" to save a PDF receipt for your records. You can also download any invoice as a PDF.`,
        steps: [
          'Click "Invoices & Payments" in the left sidebar',
          'Review your Outstanding Balance at the top',
          'Find the invoice you want to pay in the list',
          'Click "Pay Now" next to that invoice',
          'Enter your credit card or bank account details',
          'Confirm the payment amount',
          'Click "Submit Payment"',
          'Save your receipt (download PDF or check email)'
        ],
        tips: [
          'Pay invoices before the due date to maintain good standing',
          'You can download past invoices as PDFs for your tax records',
          'Set up autopay if available to never miss a payment',
          'Contact your service provider if you see charges you do not recognize'
        ],
        troubleshooting: [
          'Payment declined: Check card number, expiration date, and CVV. Try a different card.',
          'Amount seems wrong: Click the invoice to see the detailed breakdown. Contact provider if unclear.',
          'Need a payment plan: Contact your service provider to discuss payment arrangements.',
          'Receipt not received: Check spam folder. You can also download from the portal anytime.'
        ]
      },
      {
        id: 'cp-estimates',
        title: 'Reviewing and Approving Estimates',
        summary: 'How to review proposals, approve work, and decline estimates.',
        readMinutes: 4,
        content: `When your service provider recommends work, they send you an Estimate (also called a Quote or Proposal). You must approve it before work begins.

WHAT IS AN ESTIMATE?
An estimate is a detailed price quote for proposed work. It shows exactly what will be done and how much it will cost, before any work starts.

REVIEWING AN ESTIMATE:
Click "Estimates" in the sidebar. Estimates marked "Pending" are waiting for your decision.

Each estimate shows:
• Description of proposed work
• Itemized breakdown (labor, parts, materials)
• Total estimated cost
• Validity period (how long the price is guaranteed)
• Any notes or recommendations from the technician

APPROVING AN ESTIMATE:
If you agree with the proposed work and pricing:
1. Click "Approve" on the estimate
2. Add any notes or special instructions (optional)
3. Confirm your approval
4. The work will be scheduled by your service provider

DECLINING AN ESTIMATE:
If you do not want the work done:
1. Click "Decline"
2. Optionally provide a reason (helps your provider improve)
3. The estimate is closed — no work will be performed

IMPORTANT: Approving an estimate authorizes the work. The final invoice may vary slightly if additional issues are found during the work (your technician will contact you before proceeding with anything not in the original estimate).`,
        steps: [
          'Click "Estimates" in the left sidebar',
          'Look for estimates with "Pending" status',
          'Click on a pending estimate to see full details',
          'Review the work description and cost breakdown',
          'Click "Approve" if you want the work done, or "Decline" if not',
          'Add any notes or special instructions',
          'Click "Confirm" to finalize your decision'
        ],
        tips: [
          'Review estimates promptly — prices may not be guaranteed after the validity date',
          'Ask questions before approving by clicking "Message" to contact your provider',
          'You can approve part of an estimate if multiple items are listed',
          'Keep estimates for your records — they show what was recommended'
        ],
        troubleshooting: [
          'Estimate expired: Contact your provider to request an updated estimate',
          'Price seems too high: Send a message asking for clarification or alternatives',
          'Approved by mistake: Contact your provider immediately to discuss cancellation',
          'Need financing: Ask your provider about payment plans before approving'
        ]
      },
      {
        id: 'cp-equipment',
        title: 'Your Equipment & Warranties',
        summary: 'Tracking your installed equipment, warranty status, and maintenance schedules.',
        readMinutes: 3,
        content: `The Equipment page shows all equipment your service provider has installed or serviced at your property.

WHAT IS TRACKED:
• Equipment type (water heater, AC unit, furnace, etc.)
• Brand, model, and serial number
• Installation date
• Warranty status (active, expired)
• Warranty expiration date
• Recommended maintenance schedule
• Service history for that specific unit

WHY THIS MATTERS:
• Know when warranties expire so you can make claims in time
• See when maintenance is due to prevent breakdowns
• Have all equipment details in one place for insurance or selling your home
• Your technician can quickly look up your equipment when you call

MAINTENANCE REMINDERS:
If your service provider has set up maintenance schedules for your equipment, you will receive reminders when service is due. Regular maintenance extends equipment life and prevents costly emergency repairs.`,
        tips: [
          'Check this page if you need model/serial numbers for warranty claims',
          'Share this information with your home insurance provider',
          'Schedule preventive maintenance before warranty expires',
          'Note any unusual noises or performance changes to report at next service'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 3: Technician & Employee Field Guide
  // ============================================================
  {
    id: 'vol-technician',
    volumeNumber: 3,
    title: 'Technician & Employee Field Guide',
    description: 'Mobile-first guide for field technicians. Clock in/out, view today\'s jobs, navigate to sites, manage parts, and complete work orders.',
    icon: '🔧',
    color: '#e67c00',
    roles: ['technician'],
    estimatedMinutes: 35,
    chapters: [
      {
        id: 'tech-daily-workflow',
        title: 'Your Daily Workflow',
        summary: 'The standard sequence from clock-in to clock-out every workday.',
        readMinutes: 5,
        content: `As a field technician, your day follows this pattern:

MORNING START:
1. Open the ServicePro mobile app or portal on your phone/tablet
2. Clock In using the Time Clock page
3. Review "Today's Jobs" — your assigned work for the day
4. Check your route order and first job details

AT EACH JOB SITE:
1. Tap "Start Route" to navigate to the next job
2. When you arrive, tap "Arrived" to update status
3. Review the work order details: customer name, issue description, history
4. Perform the service
5. Document your work: notes, photos, parts used
6. Get customer signature if required
7. Tap "Complete Job" when finished

BETWEEN JOBS:
1. Update your availability status
2. Check for schedule changes or new assignments
3. Restock parts if needed

END OF DAY:
1. Ensure all jobs are marked complete
2. Submit any pending documentation
3. Return equipment to truck in order
4. Clock Out

YOUR STATUS OPTIONS:
• Available — ready for new assignments
• En Route — traveling to next job
• On Job — actively working at site
• On Break — scheduled break time

Keeping your status updated helps dispatchers assign new jobs efficiently and gives customers accurate arrival windows.`,
        steps: [
          'Open ServicePro on your mobile device',
          'Navigate to Time Clock and tap "Clock In"',
          'Go to "Today" to see your assigned jobs',
          'Review the first job details (customer, address, issue)',
          'Tap "Start Route" for turn-by-turn navigation',
          'Arrive at job site and tap "Arrived"',
          'Complete the work and document everything',
          'Tap "Complete Job" and move to next assignment',
          'At end of day, verify all jobs are closed',
          'Return to Time Clock and tap "Clock Out"'
        ],
        tips: [
          'Review all job notes before arriving — the customer may have provided important details',
          'Take a "before" photo at every job for documentation',
          'Update your status promptly so dispatch knows your availability',
          'If a job will take longer than estimated, notify dispatch immediately',
          'Keep your phone charged — carry a vehicle charger'
        ],
        troubleshooting: [
          'App not loading: Check your internet connection. The app works offline for basic viewing.',
          'Job not showing: Pull down to refresh, or check with dispatch.',
          'Cannot clock in: Verify you are within the allowed location range (if GPS is required).',
          'Navigation not working: Ensure location services are enabled on your device.'
        ]
      },
      {
        id: 'tech-jobs',
        title: 'Viewing & Managing Jobs',
        summary: 'How to read job details, update status, add notes, and mark completion.',
        readMinutes: 5,
        content: `The "Today" page shows all jobs assigned to you for the current day, ordered by scheduled time.

EACH JOB CARD SHOWS:
• Job title (e.g., "AC Maintenance", "Emergency Pipe Burst")
• Customer name
• Address
• Scheduled time and estimated duration
• Priority level (normal, high, emergency)

PRIORITY INDICATORS:
• Normal (blue border): Standard scheduled work
• High (yellow border): Important, prioritize if possible
• Emergency (red border): Drop everything, go immediately

JOB STATUS PROGRESSION:
Each job moves through these stages:
  Upcoming → En Route → Arrived → In Progress → Completed

You advance the status by tapping the action button on each job card:
• "Start Route" moves to En Route
• "Arrived" moves to Arrived
• "Start Work" moves to In Progress
• "Complete Job" marks it done

JOB DETAILS (tap to expand):
• Full description of the issue
• Customer contact information
• Service history at this address
• Previous technician notes
• Required parts list
• Special instructions or access codes

ADDING NOTES:
Tap "Add Note" to record:
• What you found at the site
• Work performed
• Recommendations for future service
• Parts used
• Customer communications

Notes are permanent and visible to the office team and future technicians.`,
        steps: [
          'Open "Today" from the bottom navigation',
          'Review your job list from top (earliest) to bottom (latest)',
          'Tap a job card to see full details',
          'Tap the action button to advance status (Start Route → Arrived → Start Work → Complete)',
          'Add notes during or after the job',
          'Record any parts used from your truck inventory',
          'Collect customer signature if required',
          'Mark job complete when all work is finished'
        ],
        tips: [
          'Read the full job description before arriving — it saves time on site',
          'Always update status in real-time so customers get accurate ETAs',
          'If you need to leave and return, mark the job "On Hold" (not complete)',
          'Emergency jobs override your current schedule — dispatch will reassign your other work'
        ]
      },
      {
        id: 'tech-navigation',
        title: 'Route Navigation',
        summary: 'Using the built-in navigation to get to job sites efficiently.',
        readMinutes: 3,
        content: `The Navigate page shows your optimized route for the day and provides turn-by-turn directions.

YOUR ROUTE:
Jobs are listed in the order dispatch has optimized for you, considering:
• Scheduled appointment windows
• Travel distance between sites
• Traffic patterns
• Priority levels

Each stop shows:
• Stop number (1, 2, 3...)
• Customer name and address
• Distance from your current location
• Estimated travel time

STARTING NAVIGATION:
Tap "Start Navigation" to open directions to your next stop. This uses your phone's mapping app (Google Maps or Apple Maps) for turn-by-turn guidance.

ROUTE OPTIMIZATION:
Your route is pre-optimized by the dispatch team. If you notice a more efficient order (e.g., two stops are on the same street), contact dispatch before changing the sequence — appointment windows may prevent reordering.`,
        steps: [
          'Tap "Navigate" in the bottom menu',
          'Review your stops in order (numbered 1, 2, 3...)',
          'Tap "Start Navigation" to begin route guidance',
          'Follow turn-by-turn directions to the first stop',
          'After completing a job, return to Navigate for the next stop',
          'Your position updates automatically via GPS'
        ],
        tips: [
          'Enable location services for accurate distance and ETA',
          'Check for traffic before departing — the ETA accounts for normal conditions',
          'If a customer cancels, tell dispatch so they can re-optimize your route',
          'Keep your phone mounted where you can see navigation safely while driving'
        ]
      },
      {
        id: 'tech-inventory',
        title: 'Truck Inventory & Parts',
        summary: 'Checking what parts you have, recording usage, and requesting restocks.',
        readMinutes: 4,
        content: `The Parts page shows everything currently on your truck. Use it to:
• Check if you have a part before going to a job
• Record parts used during a job
• Request restocks when supplies are low

VIEWING YOUR INVENTORY:
Your truck inventory shows:
• Part name and SKU number
• Quantity currently on hand
• Storage location (Bin A3, Rack 1, etc.)
• Low stock warnings (red when below minimum)

SEARCHING FOR PARTS:
Use the search bar to quickly find parts by name or SKU number. For example, type "valve" to find all valves, or "CPR-001" to find a specific SKU.

RECORDING PARTS USED:
After using a part on a job:
1. Open the job you are working on
2. Tap "Add Parts Used"
3. Search for the part
4. Enter the quantity used
5. This automatically deducts from your truck inventory

REQUESTING RESTOCKS:
When parts are running low:
1. Tap "Request Parts Restock"
2. Select the items you need
3. Add quantities needed
4. Submit the request
5. The warehouse team will prepare your restock

IMPORTANT: Always record parts used accurately. This affects job costing, customer billing, and inventory ordering.`,
        steps: [
          'Tap "Parts" in the bottom navigation',
          'Use search to find specific parts by name or SKU',
          'Check quantity before heading to a job that needs specific parts',
          'After using parts, go to the job and tap "Add Parts Used"',
          'Select the part and enter quantity',
          'If stock is low, tap "Request Parts Restock" at the bottom',
          'Select items and quantities needed',
          'Submit the restock request to the warehouse team'
        ],
        tips: [
          'Check parts availability BEFORE going to a job — saves a return trip',
          'Record parts immediately after use, not at end of day',
          'Keep your truck organized according to the bin locations shown',
          'Submit restock requests at end of day so warehouse can prepare overnight'
        ]
      },
      {
        id: 'tech-timeclock',
        title: 'Time Clock & Hours',
        summary: 'Clocking in/out, viewing your hours, and understanding time tracking.',
        readMinutes: 3,
        content: `The Clock page tracks your working hours.

CLOCKING IN:
When you start your shift:
1. Open the Clock page
2. Tap the green "Clock In" button
3. Your start time is recorded

CLOCKING OUT:
When your shift ends:
1. Open the Clock page
2. Tap the red "Clock Out" button
3. Your total hours for the day are calculated

YOUR WEEKLY SUMMARY:
The page shows:
• Hours worked this week (total)
• Days worked
• Overtime hours (if any, per company policy)

TIME ENTRIES:
Below the clock button, you can see all your recent time entries:
• Date
• Clock in time
• Clock out time
• Total hours for that day

If you forget to clock in or out, contact your manager to have it corrected.

BREAKS:
Some companies require you to clock out for breaks. Check your company policy. The status shows "active" while you are clocked in.`,
        steps: [
          'Tap "Clock" in the bottom navigation',
          'At start of shift: Tap the green "Clock In" button',
          'The display changes to show "Clocked In" with your start time',
          'Work your shift normally',
          'At end of shift: Tap the red "Clock Out" button',
          'Your hours are recorded automatically',
          'Review your weekly totals on the same page'
        ],
        tips: [
          'Clock in as soon as you start your shift — do not wait until first job',
          'If you forget to clock in, contact your manager for a manual correction',
          'Check your weekly hours to verify accuracy before payroll',
          'Some companies have GPS verification — ensure location is enabled'
        ],
        troubleshooting: [
          'Clock In button grayed out: You may already be clocked in. Check the status indicator.',
          'Hours seem wrong: Compare your time entries against your actual schedule and report discrepancies.',
          'Cannot clock in from home: Some companies require you to be at a certain location.',
          'Overtime showing incorrectly: Contact your manager to verify the overtime policy settings.'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 4: Dispatcher Manual
  // ============================================================
  {
    id: 'vol-dispatcher',
    volumeNumber: 4,
    title: 'Dispatcher Operations Manual',
    description: 'Master the dispatch board. Assign technicians, optimize routes, handle emergencies, and manage daily scheduling.',
    icon: '📡',
    color: '#4285f4',
    roles: ['dispatcher', 'manager', 'admin'],
    estimatedMinutes: 40,
    chapters: [
      {
        id: 'disp-board',
        title: 'The Dispatch Board',
        summary: 'Understanding the kanban board, views, and real-time job tracking.',
        readMinutes: 6,
        content: `The Dispatch Board is the operational command center for daily service delivery. It shows every job and its current status in real-time.

BOARD VIEW (Kanban):
Jobs are organized into columns by status:
• Unassigned (Red) — needs a technician assigned
• Assigned (Yellow) — technician knows about it but hasn't started
• En Route (Blue) — technician is driving to the site
• In Progress (Green) — work is being performed

Each job card shows:
• Job title and priority (○ low, ● normal, ▲ high, 🚨 emergency)
• Customer name and address
• Scheduled time and estimated duration
• Assigned technician (if any)

DRAG AND DROP:
You can drag job cards between columns to change their status. Drag an unassigned job onto a technician card in the bottom panel to assign it.

LIST VIEW:
Switch to List View for a sortable table showing all jobs with full details in rows. Better for reviewing many jobs quickly.

MAP VIEW:
Switch to Map View to see technician locations in real-time on a map. Shows who is closest to an unassigned job.

TECHNICIAN STATUS PANEL:
The bottom panel shows all technicians with:
• Current status (Available, On Job, En Route, Off Duty)
• Current assignment
• Jobs completed today vs total assigned
• Drop a job card onto a tech card to assign

PRIORITY SORTING:
Within each column, jobs sort by priority (emergencies first, then high, normal, low). Emergency jobs are highlighted with red.`,
        steps: [
          'Open "Dispatch" from the sidebar navigation',
          'Review the Board View — four columns show job status',
          'Check the "Unassigned" column first for jobs needing attention',
          'Look at the Technician Panel at the bottom for availability',
          'Drag an unassigned job card onto an available technician',
          'The job moves to "Assigned" automatically',
          'Monitor jobs as they progress through columns',
          'Use the stat cards at top for a quick overview'
        ],
        tips: [
          'Start each morning by reviewing unassigned jobs and technician availability',
          'Emergency jobs (🚨) should be assigned within 5 minutes of creation',
          'Use Map View to assign the closest available technician to urgent jobs',
          'Keep the board open all day — it updates in real-time',
          'Right-click a job card for quick actions (reassign, reschedule, call customer)'
        ],
        troubleshooting: [
          'Job stuck in wrong column: Drag it to the correct status column manually',
          'Technician shows "On Job" but job is complete: Ask tech to update status in their app',
          'New emergency not showing: Refresh the page or check notification settings',
          'Cannot drag jobs: Ensure you have Dispatch Write permission'
        ]
      },
      {
        id: 'disp-assign',
        title: 'Assigning Technicians to Jobs',
        summary: 'How to match the right technician to each job considering skills, location, and availability.',
        readMinutes: 5,
        content: `Effective assignment considers multiple factors:

ASSIGNMENT CRITERIA:
1. Skills & Certifications — Does the tech have the right qualifications?
2. Availability — Are they free at the scheduled time?
3. Proximity — How far are they from the job site?
4. Workload — How many jobs do they already have today?
5. Customer History — Has this tech served this customer before?

HOW TO ASSIGN:
Method 1 (Drag & Drop):
• Drag the job card from "Unassigned" to a technician in the bottom panel
• The job automatically moves to "Assigned" status

Method 2 (Quick Assign):
• Click the job card
• Click "Assign" in the job detail panel
• Select a technician from the dropdown
• Click "Confirm Assignment"

Method 3 (From Technician):
• Click a technician in the panel
• See their schedule for the day
• Click "+ Assign Job" to add to their schedule

REASSIGNMENT:
If you need to move a job to a different tech:
• Drag the job from its current position to the new tech
• Or click the job > "Reassign" > select new tech
• The original tech is notified of the change

AUTO-SUGGEST:
The system suggests the best technician based on skills, location, and workload. Look for the "Suggested: [Name]" hint on unassigned jobs.`,
        steps: [
          'Identify the unassigned job',
          'Check the required skills (plumbing, HVAC, electrical, etc.)',
          'Look at the Technician Panel for available qualified techs',
          'Consider distance (Map View shows locations)',
          'Drag the job card onto the chosen technician',
          'Verify the assignment was confirmed',
          'The technician receives a notification on their device'
        ],
        tips: [
          'Assign emergencies to the nearest available tech regardless of other factors',
          'Keep customer history in mind — returning technicians build trust',
          'Balance workload across the team for morale and quality',
          'Check traffic conditions before choosing between two equidistant techs',
          'If no tech is available, use the "Schedule for Later" option'
        ]
      },
      {
        id: 'disp-emergency',
        title: 'Handling Emergency Dispatches',
        summary: 'Procedures for emergency calls, priority override, and rapid response.',
        readMinutes: 5,
        content: `Emergency jobs require immediate action. They appear with a 🚨 indicator and red highlighting.

EMERGENCY PROTOCOL:
1. Emergency job appears in "Unassigned" with 🚨 priority
2. YOU MUST assign within 5 minutes
3. Pull the nearest available technician — even if it means reassigning their current job
4. If no tech is available, contact a tech on a non-emergency job to redirect them
5. Notify the office manager if wait time will exceed 30 minutes

WHAT QUALIFIES AS EMERGENCY:
• Gas leak (evacuate, call gas company, then dispatch)
• Flooding/active water damage
• Complete loss of heat in winter
• Complete loss of AC for elderly/medical patients in extreme heat
• Sewage backup
• Electrical hazard/sparking

REASSIGNING FROM NON-EMERGENCY:
When pulling a tech from their current job:
1. Click the tech's current job
2. Click "Reassign" and choose a different tech (or mark "Reschedule")
3. The customer is automatically notified of the delay
4. Assign the emergency to the freed-up tech

CUSTOMER COMMUNICATION:
• The emergency customer receives "Technician dispatched, ETA: X minutes"
• The displaced customer receives "Your appointment has been rescheduled"
• All communications are logged in the audit trail

AFTER THE EMERGENCY:
• Document response time and resolution
• Review if the emergency could have been prevented with maintenance
• Debrief if response time exceeded targets`,
        steps: [
          'Emergency job appears with 🚨 in Unassigned column',
          'Immediately identify the nearest available technician',
          'If no one is available, identify a tech on a non-critical job',
          'Reassign the non-critical job to free up the tech',
          'Assign the emergency to the freed tech',
          'Verify the tech acknowledges and starts route',
          'Monitor progress until tech arrives on site',
          'Document response time for the emergency report'
        ],
        tips: [
          'Keep a mental map of where your techs are at all times',
          'Emergency response time is a key business metric — aim for under 30 min',
          'Always have at least one tech with flexible scheduling for emergencies',
          'Gas leaks: Tell the customer to evacuate before dispatching a tech'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 5: CRM & Sales Guide
  // ============================================================
  {
    id: 'vol-crm',
    volumeNumber: 5,
    title: 'CRM & Sales Pipeline Guide',
    description: 'Manage leads, track opportunities, nurture prospects, and convert them into paying customers.',
    icon: '💼',
    color: '#9c27b0',
    roles: ['office', 'manager', 'admin'],
    estimatedMinutes: 35,
    chapters: [
      {
        id: 'crm-pipeline',
        title: 'Understanding the Sales Pipeline',
        summary: 'How leads flow from initial contact through to becoming a customer.',
        readMinutes: 5,
        content: `The CRM Pipeline visualizes your sales process as a series of stages that leads move through:

THE STAGES:
1. New — A lead just came in (website form, phone call, referral)
2. Contacted — You have reached out to the lead
3. Qualified — The lead is a good fit and has budget/timeline
4. Proposal — You have sent an estimate or quote
5. Won — They accepted and became a customer 🎉
6. Lost — They declined or went elsewhere

PIPELINE VIEW:
The pipeline shows columns for each stage (except Won/Lost). Each lead is a card you can drag between stages as you progress them.

Each card shows:
• Lead name and company
• Source (website, referral, phone, etc.)
• Estimated value ($)
• Date created

PIPELINE KPIs:
At the top you see:
• Total Pipeline Value — sum of all active leads
• Won This Month — revenue from converted leads
• Active Leads — count of leads not yet won or lost
• Conversion Rate — percentage of leads that become customers

ADDING A NEW LEAD:
Click "+ Add Lead" and fill in:
• Name (required)
• Email and/or phone
• Source (how they found you)
• Service they need
• Estimated value (how much the job might be worth)
• Notes (any context about the inquiry)

MOVING LEADS:
Drag a card to the next stage as you progress, or click the card and use the "Move to Stage" dropdown.`,
        steps: [
          'Open "CRM" from the sidebar',
          'Review the Pipeline View — leads organized by stage',
          'Check "New" leads first — these need immediate outreach',
          'Click "+ Add Lead" to create leads from incoming calls/emails',
          'After contacting a lead, drag them to "Contacted"',
          'Once you confirm they are a fit, move to "Qualified"',
          'Send an estimate, then move to "Proposal"',
          'When they accept, move to "Won" — congratulations!',
          'If they decline, move to "Lost" with a reason'
        ],
        tips: [
          'Respond to new leads within 1 hour for highest conversion rates',
          'Always log a reason when marking a lead as "Lost" — it helps improve',
          'Set follow-up reminders for leads in "Contacted" and "Proposal" stages',
          'Use the List View for sorting and filtering large numbers of leads',
          'Track your conversion rate monthly — target 20-30% for service businesses'
        ]
      },
      {
        id: 'crm-leads',
        title: 'Creating and Managing Leads',
        summary: 'How to capture leads from every source and keep records organized.',
        readMinutes: 5,
        content: `LEAD SOURCES:
Leads come from many places. ServicePro tracks the source for each:
• 🌐 Website — submitted through your public website or storefront
• 🤝 Referral — recommended by an existing customer
• 📞 Phone — called your office directly
• 🏪 Storefront — came through your ServicePro public page
• 📧 Marketing — responded to an email campaign
• 🚶 Walk-in — came to your office in person

CREATING A LEAD MANUALLY:
When someone calls or walks in:
1. Click "+ Add Lead"
2. Enter their name (required)
3. Add email and/or phone number
4. Select how they found you (source)
5. Choose what service they need
6. Estimate the job value (helps forecast revenue)
7. Add notes about what they described
8. Save

AUTOMATIC LEADS:
When someone submits a request through your public website/storefront, a lead is automatically created with source set to "Website" or "Storefront".

EDITING A LEAD:
Click any lead card to open its details. You can update:
• Contact information
• Stage (current pipeline position)
• Value estimate
• Assigned salesperson
• Notes and follow-up history
• Tags for categorization

SEARCHING & FILTERING:
Use the List View to:
• Search by name, email, phone, or company
• Filter by stage, source, or assigned person
• Sort by value, date, or last contact
• Export leads to CSV for reporting`,
        steps: [
          'When a new inquiry comes in, click "+ Add Lead"',
          'Fill in the lead name and contact details',
          'Select the source (how they found you)',
          'Enter the service they need and estimated value',
          'Add any notes from the conversation',
          'Save the lead — it appears in the "New" stage',
          'Follow up within 1 hour for best results'
        ],
        tips: [
          'Always ask "How did you hear about us?" to track sources accurately',
          'Higher-value leads should get priority follow-up',
          'Use tags to categorize leads (e.g., "commercial", "residential", "emergency")',
          'Set a daily routine: review all "New" leads first thing in the morning'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 6: Inventory Management Guide
  // ============================================================
  {
    id: 'vol-inventory',
    volumeNumber: 6,
    title: 'Inventory Management Guide',
    description: 'Track parts and materials across warehouses and trucks. Purchase orders, receiving, transfers, and stock alerts.',
    icon: '📦',
    color: '#795548',
    roles: ['office', 'manager', 'admin', 'technician'],
    estimatedMinutes: 30,
    chapters: [
      {
        id: 'inv-overview',
        title: 'Inventory Overview',
        summary: 'Understanding how ServicePro tracks your parts, materials, and supplies.',
        readMinutes: 4,
        content: `ServicePro tracks every part, material, and supply your company uses — from warehouse shelves to technician trucks.

KEY CONCEPTS:
• Items — individual parts/materials with SKU, name, category, and pricing
• Locations — where items are stored (Warehouse A, Truck #1, etc.)
• Quantity — how many of each item is at each location
• Minimum Stock Level — the threshold that triggers reorder alerts
• Transfers — moving items between locations
• Purchase Orders — ordering new stock from suppliers

THE INVENTORY DASHBOARD:
When you open Inventory, you see:
• Total Items — number of unique products tracked
• Low Stock Alerts — items below minimum level (needs attention!)
• Total Value — dollar value of all inventory
• Categories — how many product categories exist

LOW STOCK ALERTS:
Items turn red when quantity falls at or below the minimum stock level. This is your signal to reorder. Address these daily to avoid job delays.

CATEGORIES:
Items are organized by category:
• Plumbing — pipes, fittings, valves, etc.
• HVAC — filters, refrigerant, thermostats, etc.
• Electrical — wire, breakers, outlets, etc.
• Tools — specialized equipment
• Safety — PPE, first aid, etc.
• General — miscellaneous supplies`,
        steps: [
          'Open "Inventory" from the sidebar',
          'Review the KPI cards at the top (total items, low stock, value)',
          'Check "Low Stock Alerts" section — these need immediate reorder',
          'Use Search to find specific parts by name or SKU',
          'Filter by category to browse a specific type of parts',
          'Click any item row for full details and history'
        ],
        tips: [
          'Check low stock alerts every morning before dispatch',
          'Keep minimum stock levels realistic — too low causes stockouts, too high wastes money',
          'Regular cycle counts keep data accurate',
          'Train all techs to record parts used immediately after every job'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 7: Financial & Billing Guide
  // ============================================================
  {
    id: 'vol-financial',
    volumeNumber: 7,
    title: 'Financial & Billing Guide',
    description: 'Create invoices, process payments, manage expenses, track revenue, and run financial reports.',
    icon: '💰',
    color: '#2e7d32',
    roles: ['office', 'manager', 'admin'],
    estimatedMinutes: 35,
    chapters: [
      {
        id: 'fin-overview',
        title: 'Financial Dashboard Overview',
        summary: 'Understanding your revenue, expenses, profit, and cash flow at a glance.',
        readMinutes: 4,
        content: `The Financial Dashboard gives you a real-time view of your company's financial health.

KEY METRICS:
• Revenue — total money collected from customers (paid invoices)
• Outstanding — money owed to you (unpaid invoices)
• Overdue — invoices past their due date (needs follow-up!)
• Expenses — money you spent on parts, fuel, payroll, etc.
• Net Profit — Revenue minus Expenses
• Margin — Profit as a percentage of Revenue

PERIOD SELECTOR:
Switch between views: Today, This Week, This Month, This Quarter, This Year. Each period updates all KPIs and charts.

REVENUE VS EXPENSES CHART:
A visual comparison showing:
• Green bar: Revenue collected
• Red bar: Expenses paid
• Blue bar: Net profit

RECENT INVOICES TABLE:
Shows your latest invoices with customer, amount, and status. Click any invoice for details.

RECENT EXPENSES TABLE:
Shows your latest expenses with vendor, category, amount, and date.

FINANCIAL HEALTH INDICATORS:
• Green: Profit margin above 30% (healthy)
• Yellow: Profit margin 15-30% (attention)
• Red: Profit margin below 15% (concern)`,
        steps: [
          'Open "Financials" from the sidebar',
          'Select the time period you want to review (Today through Year)',
          'Review the 6 KPI cards at the top',
          'Check if any overdue invoices need follow-up',
          'Scroll down to see recent invoices and expenses',
          'Click any invoice to view details or send reminders'
        ],
        tips: [
          'Review financials weekly at minimum — daily is better',
          'Follow up on overdue invoices within 3 days of due date',
          'Track expenses in real-time rather than end-of-month batches',
          'Target a minimum 25% profit margin for service businesses'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 8: Marketing Guide
  // ============================================================
  {
    id: 'vol-marketing',
    volumeNumber: 8,
    title: 'Marketing & Growth Guide',
    description: 'Run email campaigns, collect reviews, manage referrals, and grow your customer base.',
    icon: '📣',
    color: '#e91e63',
    roles: ['office', 'manager', 'admin'],
    estimatedMinutes: 25,
    chapters: [
      {
        id: 'mkt-campaigns',
        title: 'Creating Marketing Campaigns',
        summary: 'How to create, send, and track email and SMS campaigns.',
        readMinutes: 5,
        content: `Marketing campaigns help you stay in touch with customers and generate new business.

CAMPAIGN TYPES:
• 📧 Email — newsletters, promotions, seasonal reminders
• 💬 SMS — short text messages for time-sensitive offers
• ⭐ Review Request — ask happy customers for Google/Yelp reviews
• 🤝 Referral — incentivize customers to refer friends
• 🎟 Coupon — discount offers for new or returning customers

CREATING A CAMPAIGN:
1. Click "+ New Campaign"
2. Choose the campaign type
3. Enter a campaign name (internal, customers won't see this)
4. Write the subject line (for email) or message (for SMS)
5. Write the body content
6. Select your audience (all customers, recent customers, specific tags)
7. Choose to send now or schedule for later
8. Click "Send" or "Schedule"

TRACKING RESULTS:
After sending, track:
• Sent — how many messages were delivered
• Opened — how many recipients opened the message
• Clicked — how many clicked a link inside
• Converted — how many took the desired action (booked, paid, etc.)

BEST PRACTICES:
• Send no more than 2-4 campaigns per month
• Always include an unsubscribe link (required by law)
• Test your message on yourself before mass-sending
• Personalize when possible (customer name, last service date)`,
        steps: [
          'Open "Marketing" from the sidebar',
          'Click "+ New Campaign" button',
          'Select the campaign type (Email, SMS, Review, etc.)',
          'Enter a descriptive name for internal tracking',
          'Write your subject and body content',
          'Select your target audience',
          'Preview the message',
          'Click "Send Now" or "Schedule" for later',
          'Monitor results on the campaign list'
        ],
        tips: [
          'Best sending times: Tuesday-Thursday, 9-11 AM',
          'Keep SMS under 160 characters for reliability',
          'Include a clear call-to-action (Book Now, Call Us, Leave Review)',
          'Seasonal campaigns perform well (spring AC tune-ups, fall heating prep)',
          'Always test by sending to yourself first'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 9: Website Builder Guide
  // ============================================================
  {
    id: 'vol-website',
    volumeNumber: 9,
    title: 'Website Builder Guide',
    description: 'Build and publish your company website. Pages, themes, SEO, media, and publishing.',
    icon: '🌐',
    color: '#00bcd4',
    roles: ['admin', 'manager'],
    estimatedMinutes: 40,
    chapters: [
      {
        id: 'web-getting-started',
        title: 'Getting Started with Your Website',
        summary: 'Creating your first page and understanding how the website builder works.',
        readMinutes: 5,
        content: `The Website Builder lets you create a professional multi-page website for your service company without any coding knowledge.

HOW IT WORKS:
Your website is built from Pages. Each page is made of Sections. Sections are pre-designed building blocks you stack in the order you want.

AVAILABLE SECTION TYPES:
• Hero Banner — large image with headline and call-to-action button
• Services Grid — showcase your services with icons and descriptions
• Testimonials — customer reviews and ratings
• About Section — your company story with image
• Contact Form — let visitors send inquiries
• Image Gallery — portfolio of completed work
• Call to Action — promotional banner with button
• FAQ — common questions and answers
• Pricing Table — service pricing tiers
• Team Members — show your technicians/staff
• Features List — highlight your advantages
• Rich Text — custom written content
• Custom HTML — advanced custom code (developers only)

CREATING YOUR FIRST PAGE:
1. Open Website Builder from the sidebar
2. Click "Pages" tab (default view)
3. Type a page title in the input field (e.g., "Home")
4. Click "Create Page"
5. Click "Edit" on your new page
6. The editor opens with a section palette on the left
7. Click a section type to add it to your page
8. Repeat to build your page layout

PUBLISHING:
Pages start as "Draft" (not visible to the public). When ready:
1. Preview your page
2. Click "Publish"
3. The page goes live immediately`,
        steps: [
          'Open "Website Builder" from the sidebar',
          'In the Pages tab, enter a title like "Home" or "About Us"',
          'Click "Create Page" — the page appears in the list as Draft',
          'Click "Edit" to open the visual editor',
          'On the left panel, you see all available section types',
          'Click "Hero Banner" to add a hero section to your page',
          'Click "Services Grid" to add a services section',
          'Continue adding sections to build your page layout',
          'When satisfied, go back to Pages and click "Publish"',
          'Your page is now live on the internet!'
        ],
        tips: [
          'Start with just a Home page — you can always add more later',
          'Most service company websites need: Home, About, Services, Contact',
          'The Hero Banner should have a clear headline and one action button',
          'Use real photos of your team and work — stock photos look generic',
          'Keep pages focused — one main topic per page'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 10: AI Assistant Guide
  // ============================================================
  {
    id: 'vol-ai',
    volumeNumber: 10,
    title: 'AI Assistant & Knowledge Base Guide',
    description: 'Use the AI chat assistant, build your knowledge base, and leverage AI for recommendations.',
    icon: '🤖',
    color: '#673ab7',
    roles: ['technician', 'dispatcher', 'office', 'manager', 'admin'],
    estimatedMinutes: 20,
    chapters: [
      {
        id: 'ai-chat',
        title: 'Using the AI Chat Assistant',
        summary: 'How to ask questions and get instant answers about your business operations.',
        readMinutes: 4,
        content: `The AI Assistant is like having a knowledgeable coworker available 24/7. It can answer questions about your operations, search your knowledge base, and provide recommendations.

HOW TO USE:
1. Open "AI Assistant" from the sidebar
2. Type your question in the message box at the bottom
3. Press Enter or click "Send"
4. The AI responds with relevant information
5. Ask follow-up questions for more detail

WHAT YOU CAN ASK:
• "How do I create a work order?"
• "What is the warranty on a Rheem water heater?"
• "What parts do I need for a standard AC maintenance?"
• "How long does a tankless water heater install take?"
• "What is the procedure for a gas leak response?"
• "Show me our pricing for drain cleaning"

THE AI DRAWS FROM:
• Your company's Knowledge Base articles
• Standard service industry procedures
• Product specifications and manuals (if uploaded)
• Your company's policies and procedures

SOURCES:
When the AI references specific knowledge base articles, it shows "Sources" at the bottom of its response. Click these to read the full article.

LIMITATIONS:
• The AI cannot access real-time job data or customer records (for privacy)
• It cannot make changes to the system — only provide information
• For sensitive decisions, always verify with a manager
• If the AI says "I don't have information about that," the topic may not be in your knowledge base`,
        steps: [
          'Click "AI Assistant" in the sidebar navigation',
          'Type your question in the message box at the bottom',
          'Press Enter or click the "Send" button',
          'Read the AI response',
          'Click on "Sources" links for full articles',
          'Ask follow-up questions for more detail',
          'Click "Was this helpful?" to improve responses over time'
        ],
        tips: [
          'Be specific in your questions for better answers',
          'The AI improves as more articles are added to the Knowledge Base',
          'Use it before calling a supervisor — it may have your answer instantly',
          'If an answer seems wrong, report it so the Knowledge Base can be corrected',
          'The AI remembers the conversation context — you can ask follow-ups'
        ]
      },
      {
        id: 'ai-knowledge-base',
        title: 'Building the Knowledge Base',
        summary: 'How to create articles that power the AI assistant and help your team.',
        readMinutes: 5,
        content: `The Knowledge Base is a library of articles about your business. The more articles you add, the smarter the AI Assistant becomes.

WHO SHOULD ADD ARTICLES:
• Managers: company policies, procedures, pricing
• Experienced technicians: troubleshooting guides, product knowledge
• Office staff: customer FAQ, booking procedures, billing policies
• Admins: system configuration, integrations, company info

ARTICLE CATEGORIES:
• General — company information and policies
• Troubleshooting — how to diagnose and fix common issues
• Procedures — step-by-step instructions for tasks
• Safety — safety protocols and emergency procedures
• Products — equipment specifications, warranty info
• FAQ — frequently asked questions and answers

CREATING AN ARTICLE:
1. Open "Knowledge Base" from the sidebar
2. Click "+ New Article"
3. Enter a clear, descriptive title
4. Select the appropriate category
5. Write the content (supports markdown formatting)
6. Click "Publish Article"

WRITING TIPS:
• Use clear, simple language
• Break content into short paragraphs
• Include step-by-step instructions where applicable
• Add specific part numbers, measurements, and specs
• Think about what questions a new employee would ask`,
        steps: [
          'Open "Knowledge Base" from the sidebar',
          'Click "+ New Article" button',
          'Enter a descriptive title (e.g., "How to Replace an AC Filter")',
          'Select the category (Troubleshooting, Procedures, etc.)',
          'Write the article content in the editor',
          'Include specific details: part numbers, time estimates, warnings',
          'Click "Publish Article" when ready',
          'The AI can now use this article to answer questions'
        ],
        tips: [
          'Write articles as if explaining to a new employee on their first day',
          'One topic per article — keep them focused',
          'Update articles when procedures change',
          'Check "View Count" to see which articles are most useful',
          'Articles with high "Helpful" counts are working well — write more like them'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 11: Automation Guide
  // ============================================================
  {
    id: 'vol-automation',
    volumeNumber: 11,
    title: 'Workflow Automation Guide',
    description: 'Build automated workflows with triggers, conditions, and actions to eliminate repetitive tasks.',
    icon: '⚡',
    color: '#ff5722',
    roles: ['manager', 'admin'],
    estimatedMinutes: 25,
    chapters: [
      {
        id: 'auto-basics',
        title: 'Automation Basics',
        summary: 'What automation is and how it saves time for your service business.',
        readMinutes: 4,
        content: `Workflow automation lets you create rules that automatically perform tasks when certain events happen. Instead of manually doing repetitive work, the system handles it for you.

EXAMPLE AUTOMATIONS:
• When a job is completed → automatically create an invoice
• When an invoice is overdue by 3 days → send a reminder email
• When a new customer is created → send a welcome email
• When a lead is created from website → assign to the next available salesperson
• Every Monday at 8 AM → send the weekly schedule to all technicians

HOW AUTOMATIONS WORK:
Every workflow has three parts:
1. TRIGGER — the event that starts the automation
2. CONDITIONS (optional) — filters that must be true
3. ACTIONS — what the automation does

AVAILABLE TRIGGERS:
• Manual — you run it by clicking a button
• Job Created — when a new work order is made
• Job Completed — when a technician marks a job done
• Invoice Created — when an invoice is generated
• Invoice Overdue — when payment is past due
• Customer Created — when a new customer is added
• Lead Stage Changed — when a CRM lead moves stages
• Appointment Booked — when a customer requests service
• Scheduled — runs on a recurring schedule (daily, weekly, etc.)

AVAILABLE ACTIONS:
• Send Email — notify customers or staff
• Send SMS — text message notification
• Create Task — add a follow-up task for someone
• Assign Technician — automatically assign jobs
• Update Status — change a record's status
• Create Invoice — generate an invoice from a job
• Add Note — document something automatically
• Call Webhook — integrate with external systems
• Wait/Delay — pause before the next action
• If/Else Condition — take different paths based on conditions`,
        steps: [
          'Open "Automation" from the sidebar',
          'Click "+ Create" to build a new workflow',
          'Give your workflow a descriptive name',
          'Select a Trigger (what starts the automation)',
          'Add one or more Actions (what the automation does)',
          'Click "Create Workflow"',
          'Click "Activate" to turn it on',
          'The workflow now runs automatically when triggered!'
        ],
        tips: [
          'Start simple — automate one task at a time',
          'Test workflows with a manual trigger first before connecting to real events',
          'Monitor execution counts to verify workflows are running correctly',
          'Pause workflows if you need to make changes (do not delete and recreate)',
          'Common first automations: invoice after job complete, reminder for overdue invoices'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 12: Company Administrator Guide
  // ============================================================
  {
    id: 'vol-company-admin',
    volumeNumber: 12,
    title: 'Company Administrator Guide',
    description: 'Complete guide to configuring your company: branding, users, roles, permissions, integrations, and settings.',
    icon: '⚙️',
    color: '#607d8b',
    roles: ['admin'],
    estimatedMinutes: 45,
    chapters: [
      {
        id: 'admin-users',
        title: 'Managing Users & Roles',
        summary: 'How to add employees, assign roles, and manage permissions.',
        readMinutes: 6,
        content: `As a Company Administrator, you control who can access what in ServicePro.

ROLES EXPLAINED:
• Owner — Full access to everything. Can manage other users.
• Admin — Same as Owner but cannot change billing or delete the account.
• Manager — Operations access plus reports and team management.
• Technician — Field access: jobs, schedule, parts, time clock.
• Billing — Financial access: invoices, payments, estimates, reports.
• Read Only — Can view everything but change nothing.

ADDING A NEW USER:
1. Go to Settings > Team Management
2. Click "+ Add Team Member"
3. Enter their name, email, and phone
4. Select their role
5. Choose which modules they can access
6. Click "Create Account"
7. They receive a welcome email with login instructions

MANAGING PERMISSIONS:
Each role has default permissions, but you can customize:
• Which modules a user can see
• Whether they can create, edit, or only view records
• Which locations or departments they belong to
• Whether they can export data

DEACTIVATING USERS:
When an employee leaves:
1. Go to their profile in Team Management
2. Click "Deactivate Account"
3. Their access is immediately revoked
4. Their historical records (jobs completed, time entries) are preserved

NEVER delete a user account — always deactivate. Deletion removes their work history.`,
        steps: [
          'Open "Settings" from the sidebar',
          'Navigate to "Team Management"',
          'Click "+ Add Team Member"',
          'Fill in the employee details (name, email, phone)',
          'Select their role (Technician, Manager, etc.)',
          'Choose which modules they should access',
          'Click "Create Account"',
          'The employee receives a welcome email with temporary credentials',
          'They log in and set their password'
        ],
        tips: [
          'Follow the principle of least privilege — give only the access needed',
          'Review user access quarterly and after any role changes',
          'Use the Read Only role for accountants or auditors who need to view data',
          'When someone is promoted, update their role — do not create a new account',
          'Keep at least 2 Admin users so you are never locked out'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 13: Platform Administrator Guide
  // ============================================================
  {
    id: 'vol-platform-admin',
    volumeNumber: 13,
    title: 'Platform Administrator Guide',
    description: 'Manage the entire SaaS platform: tenants, subscriptions, security, monitoring, deployments, and infrastructure.',
    icon: '🏗️',
    color: '#263238',
    roles: ['platform_admin'],
    estimatedMinutes: 60,
    chapters: [
      {
        id: 'pa-overview',
        title: 'Platform Administration Overview',
        summary: 'Understanding the Platform Admin Operations Center and your responsibilities.',
        readMinutes: 5,
        content: `As a Platform Administrator, you manage the entire ServicePro SaaS infrastructure — not just one company, but ALL companies using the platform.

YOUR RESPONSIBILITIES:
• Tenant Management — create/configure/suspend companies
• Subscriptions & Billing — manage plans, seats, and platform billing
• Security — API keys, OAuth clients, impersonation, sessions
• Monitoring — system health, performance, errors, uptime
• Audit — compliance, activity logs, security events
• Deployment — releases, migrations, rollbacks, environments
• Backups — snapshots, schedules, restore points
• Support — tenant tickets, escalations, announcements
• AI — model configuration, usage tracking, governance
• Configuration — global settings, email, storage, rate limits, feature gates

THE OPERATIONS CENTER:
Access Platform Admin from the sidebar. The Operations Center is organized into 11 sections, each with its own navigation sub-items.

PLATFORM DASHBOARD:
The main dashboard shows:
• Total tenants (active, trial, suspended, archived)
• Total users across all tenants
• Active impersonation sessions
• Monthly revenue
• System health score
• Recent audit events

CRITICAL RULES:
1. Never reveal tenant data to other tenants
2. Always audit impersonation sessions
3. Run migrations before deploying code that depends on them
4. Keep at least 2 platform admins active at all times
5. Review security events daily`,
        steps: [
          'Click "Platform Admin" in the sidebar',
          'You arrive at the Platform Dashboard with key metrics',
          'Use the sub-navigation to access specific areas',
          'Start each day by reviewing: Health → Audit → Support tickets',
          'Address any critical alerts before other work'
        ],
        tips: [
          'Keep the dashboard open in a dedicated browser tab',
          'Set up email alerts for critical system events',
          'Document all impersonation sessions with business justification',
          'Schedule monthly reviews of all tenant health scores',
          'Maintain runbooks for common platform operations'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 14: API Reference Guide
  // ============================================================
  {
    id: 'vol-api',
    volumeNumber: 14,
    title: 'API Reference & Developer Guide',
    description: 'Complete REST API documentation. Authentication, endpoints, examples, and error handling.',
    icon: '🔌',
    color: '#37474f',
    roles: ['developer', 'platform_admin'],
    estimatedMinutes: 45,
    chapters: [
      {
        id: 'api-auth',
        title: 'API Authentication',
        summary: 'How to authenticate with the API using Bearer tokens and API keys.',
        readMinutes: 5,
        content: `All API requests (except public endpoints) require authentication.

AUTHENTICATION METHODS:

1. Bearer Token (JWT):
   Log in via POST /auth/login with email and password.
   Receive an access token in the response.
   Include it in all subsequent requests:
   Authorization: Bearer <your-access-token>

2. API Key:
   Create API keys in Settings > API Keys.
   Include as Bearer token in the Authorization header.
   API keys never expire but can be revoked.

REQUIRED HEADERS:
Every request must include:
• Authorization: Bearer <token>
• X-Tenant-Id: <your-tenant-id>
• Content-Type: application/json (for POST/PATCH/PUT)

AUTHENTICATION FLOW:
1. POST /auth/login → receive access token + refresh token
2. Use access token for API calls (valid 15 minutes)
3. When expired, POST /auth/refresh with refresh token
4. Receive new access token
5. If refresh fails, user must log in again

ERROR RESPONSES:
• 401 Unauthorized — token missing, invalid, or expired
• 403 Forbidden — valid token but insufficient permissions
• 429 Too Many Requests — rate limit exceeded

RATE LIMITS:
• General: 100 requests per minute
• Authentication: 10 attempts per minute
• File uploads: 20 per minute

EXAMPLE LOGIN:
POST /auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "your-password"
}

Response:
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "rt_abc123...",
    "expiresIn": 900
  }
}`,
        steps: [
          'Send POST /auth/login with email and password',
          'Store the accessToken from the response',
          'Include "Authorization: Bearer <token>" in all API requests',
          'Include "X-Tenant-Id: <tenant>" in all API requests',
          'When you get a 401, refresh using POST /auth/refresh',
          'If refresh fails, log in again'
        ],
        tips: [
          'Store tokens securely — never log them or include in URLs',
          'Use API keys for server-to-server integrations (they do not expire)',
          'Implement automatic token refresh in your client code',
          'Rate limit errors (429) include a Retry-After header — respect it'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 15: Troubleshooting Guide
  // ============================================================
  {
    id: 'vol-troubleshooting',
    volumeNumber: 15,
    title: 'Troubleshooting Guide',
    description: 'Solutions to common problems. Error messages, recovery procedures, and diagnostic steps.',
    icon: '🔍',
    color: '#d32f2f',
    roles: ['technician', 'dispatcher', 'office', 'manager', 'admin', 'platform_admin'],
    estimatedMinutes: 20,
    chapters: [
      {
        id: 'ts-common',
        title: 'Common Problems & Solutions',
        summary: 'Quick fixes for the most frequently reported issues.',
        readMinutes: 5,
        content: `PROBLEM: "I cannot log in"
SOLUTIONS:
• Verify you are using the correct email address
• Check if Caps Lock is on
• Click "Forgot Password" to reset
• Clear browser cache and cookies
• Try a different browser
• If account is locked, wait 15 minutes or contact admin

PROBLEM: "Page not loading or showing errors"
SOLUTIONS:
• Refresh the page (Ctrl+R or Cmd+R)
• Clear browser cache (Ctrl+Shift+Delete)
• Check internet connection
• Try incognito/private browsing mode
• Check if the service is under maintenance (System Status page)

PROBLEM: "I cannot see a feature that others can"
SOLUTIONS:
• Your role may not include that module
• Contact your administrator to verify your permissions
• Check if you are in the correct tenant/workspace
• The feature may be disabled for your company's plan

PROBLEM: "Data seems missing or incorrect"
SOLUTIONS:
• Check your filters — you may have a filter active that hides records
• Verify you are in the correct date range
• Clear all filters and search again
• If data is genuinely missing, report to your administrator immediately

PROBLEM: "Cannot create/edit records"
SOLUTIONS:
• Verify you have write permission for that module
• Check if the record is locked by another user
• Ensure all required fields are filled in
• Check if you have reached a plan limit (max customers, etc.)

PROBLEM: "Notifications not arriving"
SOLUTIONS:
• Check notification settings in your profile
• Verify email is not going to spam
• For SMS: verify phone number is correct with country code
• Check if notifications are enabled for that event type`,
        tips: [
          'Always try refreshing the page first — many issues are temporary',
          'Screenshot error messages before reporting them',
          'Include the URL, time, and what you were doing when reporting issues',
          'Check System Status before assuming something is broken'
        ]
      }
    ]
  },

  // ============================================================
  // Volume 16: Keyboard Shortcuts & Quick Reference
  // ============================================================
  {
    id: 'vol-shortcuts',
    volumeNumber: 16,
    title: 'Keyboard Shortcuts & Quick Reference',
    description: 'All keyboard shortcuts, quick actions, and reference tables in one place.',
    icon: '⌨️',
    color: '#455a64',
    roles: ['technician', 'dispatcher', 'office', 'manager', 'admin', 'platform_admin', 'developer'],
    estimatedMinutes: 5,
    chapters: [
      {
        id: 'kb-shortcuts',
        title: 'Keyboard Shortcuts',
        summary: 'Complete list of keyboard shortcuts for power users.',
        readMinutes: 3,
        content: `GLOBAL SHORTCUTS (work on any page):
• Ctrl+K / Cmd+K — Open global search
• Ctrl+N / Cmd+N — Create new (context-sensitive)
• Escape — Close current dialog or panel
• ? — Show keyboard shortcut help
• Ctrl+/ — Toggle sidebar navigation
• Alt+1 through Alt+9 — Jump to sidebar item 1-9

NAVIGATION:
• G then D — Go to Dashboard
• G then C — Go to Customers
• G then J — Go to Jobs/Work Orders
• G then I — Go to Invoices
• G then S — Go to Schedule
• G then T — Go to Technicians
• G then R — Go to Reports

TABLE SHORTCUTS:
• ↑/↓ — Navigate rows
• Enter — Open selected row
• Ctrl+A — Select all rows
• Delete — Delete selected (with confirmation)
• E — Edit selected row
• Space — Toggle selection

FORMS:
• Tab — Move to next field
• Shift+Tab — Move to previous field
• Ctrl+Enter — Submit form
• Escape — Cancel/close form

DISPATCH BOARD:
• 1-4 — Switch between columns (Unassigned, Assigned, En Route, In Progress)
• R — Refresh board data
• F — Toggle filter panel
• M — Switch to Map view
• L — Switch to List view
• B — Switch to Board view`
      }
    ]
  }
];
