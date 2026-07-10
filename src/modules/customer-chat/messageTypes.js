const CHAT_SENDER_TYPES = {
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  SYSTEM: 'system'
};

const CHAT_THREAD_STATUSES = {
  OPEN: 'open',
  WAITING_ON_CUSTOMER: 'waiting_on_customer',
  WAITING_ON_COMPANY: 'waiting_on_company',
  CLOSED: 'closed'
};

module.exports = { CHAT_SENDER_TYPES, CHAT_THREAD_STATUSES };
