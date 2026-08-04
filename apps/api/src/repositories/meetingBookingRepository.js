const { makeId, now } = require('../services/id');

function createMeetingBookingRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    // Booking pages
    listPages(tenantId, filters = {}) {
      const d = data(); d.meetingBookingPages ||= [];
      let r = d.meetingBookingPages.filter(p => p.tenantId === tenantId);
      if (filters.owner_id) r = r.filter(p => p.ownerId === filters.owner_id);
      return r;
    },

    findPageById(tenantId, id) {
      const d = data(); d.meetingBookingPages ||= [];
      return d.meetingBookingPages.find(p => p.tenantId === tenantId && p.id === id) || null;
    },

    findPageBySlug(tenantId, slug) {
      const d = data(); d.meetingBookingPages ||= [];
      return d.meetingBookingPages.find(p => p.tenantId === tenantId && p.slug === slug) || null;
    },

    createPage(tenantId, input) {
      const d = data(); d.meetingBookingPages ||= [];
      const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (d.meetingBookingPages.some(p => p.tenantId === tenantId && p.slug === slug)) {
        throw Object.assign(new Error('Booking page slug already exists'), { code: 'slug_conflict', status: 409 });
      }
      const page = {
        id: makeId('bkpg'), tenantId, ownerId: input.owner_id, slug, name: input.name || '',
        description: input.description || '',
        durationMinutes: input.duration_minutes || 30,
        bufferMinutes: input.buffer_minutes || 0,
        availability: input.availability || {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }]
        },
        timezone: input.timezone || 'America/New_York',
        location: input.location || 'phone',
        questions: input.questions || [],
        settings: input.settings || { confirmation_email: true, reminder_minutes: 60, max_per_day: 8 },
        isActive: input.is_active !== false,
        createdAt: now(), updatedAt: now()
      };
      d.meetingBookingPages.push(page); save(d); return page;
    },

    updatePage(tenantId, id, input) {
      const d = data(); d.meetingBookingPages ||= [];
      const idx = d.meetingBookingPages.findIndex(p => p.tenantId === tenantId && p.id === id);
      if (idx === -1) return null;
      const page = d.meetingBookingPages[idx];
      const fields = ['name', 'description', 'duration_minutes', 'buffer_minutes', 'availability', 'timezone', 'location', 'questions', 'is_active'];
      for (const f of fields) {
        if (input[f] !== undefined) {
          const camel = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          page[camel] = input[f];
        }
      }
      if (input.settings) page.settings = { ...page.settings, ...input.settings };
      page.updatedAt = now(); save(d); return page;
    },

    deletePage(tenantId, id) {
      const d = data(); d.meetingBookingPages ||= [];
      const idx = d.meetingBookingPages.findIndex(p => p.tenantId === tenantId && p.id === id);
      if (idx === -1) return null;
      d.meetingBookingPages.splice(idx, 1); save(d); return { deleted: true };
    },

    // Bookings
    listBookings(tenantId, filters = {}) {
      const d = data(); d.meetingBookings ||= [];
      let r = d.meetingBookings.filter(b => b.tenantId === tenantId);
      if (filters.booking_page_id) r = r.filter(b => b.bookingPageId === filters.booking_page_id);
      if (filters.contact_id) r = r.filter(b => b.contactId === filters.contact_id);
      if (filters.status) r = r.filter(b => b.status === filters.status);
      return r.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    },

    createBooking(tenantId, pageId, input) {
      const d = data(); d.meetingBookings ||= [];
      const booking = {
        id: makeId('mtg'), tenantId, bookingPageId: pageId,
        contactId: input.contact_id || null,
        guestName: input.guest_name || '', guestEmail: input.guest_email,
        guestPhone: input.guest_phone || '',
        startTime: input.start_time, endTime: input.end_time,
        status: 'confirmed', notes: input.notes || '',
        answers: input.answers || {}, outcome: null,
        cancelledAt: null, rescheduledFrom: null, createdAt: now()
      };
      d.meetingBookings.push(booking); save(d); return booking;
    },

    updateBooking(tenantId, id, input) {
      const d = data(); d.meetingBookings ||= [];
      const idx = d.meetingBookings.findIndex(b => b.tenantId === tenantId && b.id === id);
      if (idx === -1) return null;
      const b = d.meetingBookings[idx];
      if (input.status !== undefined) {
        b.status = input.status;
        if (input.status === 'cancelled') b.cancelledAt = now();
        if (input.status === 'rescheduled') b.rescheduledFrom = b.startTime;
      }
      if (input.start_time) b.startTime = input.start_time;
      if (input.end_time) b.endTime = input.end_time;
      if (input.outcome) b.outcome = input.outcome;
      if (input.notes) b.notes = input.notes;
      save(d); return b;
    }
  };
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createMeetingBookingRepository };
