export type CampaignChannel = 'email' | 'sms' | 'phone' | 'mail';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';

export type MarketingCampaign = {
  id: string;
  tenantId: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audienceDefinition: Record<string, unknown>;
  messageTemplateId?: string;
  scheduledAt?: string;
};

export type CampaignRecipient = {
  id: string;
  tenantId: string;
  campaignId: string;
  customerId?: string;
  leadId?: string;
  status: 'queued' | 'sent' | 'failed' | 'responded' | 'unsubscribed';
};
