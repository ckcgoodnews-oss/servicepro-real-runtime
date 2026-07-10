const MATCHING_RULES = [
  {
    key: 'exact_amount_invoice',
    description: 'Match bank deposit to open invoice payment by exact amount.'
  },
  {
    key: 'date_window_amount',
    description: 'Match transaction to payment when amount matches and date is within configured window.'
  },
  {
    key: 'provider_reference',
    description: 'Match using external payment provider transaction/reference id.'
  }
];

module.exports = { MATCHING_RULES };
