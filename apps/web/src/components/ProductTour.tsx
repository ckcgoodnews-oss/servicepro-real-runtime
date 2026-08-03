'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '@/auth/session';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighted element
  action?: string; // URL to navigate to
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Welcome to your dashboard',
    description: 'This is your command center. See today\'s activity, upcoming appointments, and setup progress at a glance.',
    target: '.dashboard-overview',
    action: '/dashboard'
  },
  {
    id: 'customers',
    title: 'Your customers',
    description: 'Add customers with their contact details, service history, and equipment records. Everything in one place.',
    target: '[data-nav="customers"]',
    action: '/customers'
  },
  {
    id: 'scheduling',
    title: 'Scheduling & appointments',
    description: 'Create appointments, assign dates, and link to service types. Your calendar fills automatically.',
    target: '[data-nav="scheduling"]',
    action: '/scheduling'
  },
  {
    id: 'dispatch',
    title: 'Dispatch board',
    description: 'Assign technicians to jobs, track their status in real time, and manage your team\'s daily workload.',
    target: '[data-nav="dispatch"]',
    action: '/dispatch'
  },
  {
    id: 'jobs',
    title: 'Work orders',
    description: 'Create jobs with details, checklists, notes, and materials. Track progress from creation to completion.',
    target: '[data-nav="jobs"]',
    action: '/jobs'
  },
  {
    id: 'estimates',
    title: 'Estimates & invoices',
    description: 'Generate estimates, convert them to invoices, send to customers, and record payments. The full billing cycle.',
    target: '[data-nav="estimates"]',
    action: '/estimates'
  },
  {
    id: 'portal',
    title: 'Customer portal',
    description: 'Your customers can book appointments, view invoices, approve estimates, and communicate with your team.',
    target: '[data-nav="portal"]',
    action: '/portal'
  },
  {
    id: 'storefront',
    title: 'Storefront builder',
    description: 'Build a professional website where new customers find you, see your services, and request appointments.',
    target: '[data-nav="storefront"]',
    action: '/storefront-builder'
  },
  {
    id: 'reports',
    title: 'Reports & insights',
    description: 'See revenue, job completion rates, technician performance, and operational KPIs in real-time dashboards.',
    target: '[data-nav="reports"]',
    action: '/reports'
  },
  {
    id: 'help',
    title: 'Help & learning',
    description: 'Access documentation, tutorials, and the AI assistant whenever you need guidance. We\'re here to help.',
    target: '[data-nav="help"]',
    action: '/documentation'
  }
];

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if tour was already completed or dismissed
    const tourDone = localStorage.getItem('servicepro.tour.completed');
    if (tourDone) { setCompleted(true); return; }

    // Auto-start for new trial users after short delay
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') === 'trial') {
      setTimeout(() => setActive(true), 1500);
    }
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    setCompleted(true);
    localStorage.setItem('servicepro.tour.completed', 'true');
    // Record tour completion on server
    authFetch('/api/v1/trial/onboarding/tour', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    }).catch(() => {});
  }, []);

  const skip = useCallback(() => {
    setActive(false);
    localStorage.setItem('servicepro.tour.completed', 'skipped');
  }, []);

  const next = () => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      finish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  // Public start method (for "Restart tour" in help menu)
  const start = useCallback(() => {
    setCurrentStep(0);
    setActive(true);
    setCompleted(false);
    localStorage.removeItem('servicepro.tour.completed');
  }, []);

  if (!active || completed) {
    // Render a hidden restart button that can be triggered from help
    return (
      <button
        className="tour-restart-trigger"
        onClick={start}
        data-tour-restart
        style={{ display: 'none' }}
        aria-hidden="true"
      >
        Restart tour
      </button>
    );
  }

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="product-tour-overlay" role="dialog" aria-label="Product tour" aria-modal="false">
      <div className="product-tour-backdrop" onClick={skip} />
      <div className="product-tour-tooltip" data-position={step.position || 'bottom'}>
        <div className="tour-header">
          <span className="tour-progress">{currentStep + 1} of {TOUR_STEPS.length}</span>
          <button className="tour-close" onClick={skip} aria-label="Skip tour">✕</button>
        </div>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <div className="tour-actions">
          {currentStep > 0 && (
            <button className="button-outline button-small" onClick={prev}>Previous</button>
          )}
          <button className="button button-small" onClick={next}>
            {currentStep >= TOUR_STEPS.length - 1 ? 'Finish tour' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to start tour programmatically
export function startProductTour() {
  const btn = document.querySelector('[data-tour-restart]') as HTMLButtonElement | null;
  if (btn) btn.click();
}
