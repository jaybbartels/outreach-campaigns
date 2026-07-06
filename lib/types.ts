export interface Campaign {
  id: string
  user_id: string
  name: string
  collection_id?: string
  channel: string
  purpose?: string
  status: string
  total_recipients: number
  sent_count: number
  opened_count: number
  clicked_count: number
  replied_count: number
  created_at: string
  started_at?: string
  completed_at?: string
  updated_at: string
}

export interface CampaignMessage {
  id: string
  campaign_id: string
  executive_id: string
  executive_name: string
  executive_email: string
  message_content: string
  channel: string
  status: string
  send_attempt_count: number
  sent_at?: string
  opened_at?: string
  clicked_at?: string
  replied_at?: string
  sendgrid_message_id?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface CampaignResponse {
  id: string
  campaign_message_id: string
  executive_id: string
  response_type?: string
  response_text?: string
  response_channel?: string
  ai_sentiment?: string
  created_at: string
}
