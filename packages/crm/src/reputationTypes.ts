export type ReviewPlatform = 'google' | 'facebook' | 'yelp' | 'internal' | 'other';

export type ReviewRequest = {
  id: string;
  tenantId: string;
  customerId: string;
  jobId?: string;
  platform: ReviewPlatform;
  requestChannel: 'email' | 'sms';
  status: 'queued' | 'sent' | 'clicked' | 'completed' | 'failed';
};

export type CustomerReview = {
  id: string;
  tenantId: string;
  customerId: string;
  platform: ReviewPlatform;
  rating: number;
  reviewText?: string;
  receivedAt: string;
};
