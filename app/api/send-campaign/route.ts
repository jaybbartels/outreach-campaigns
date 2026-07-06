import sgMail from '@sendgrid/mail'
import { supabase } from '@/lib/supabase'

const client = sgMail
client.setApiKey(process.env.SENDGRID_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { campaignId, messages, bdEmail, bdName } = await request.json()

    if (!campaignId || !messages || !bdEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const results = []

    for (const msg of messages) {
      try {
        const email = {
          to: msg.executive_email,
          from: bdEmail,
          subject: `Hi ${msg.executive_name}`,
          html: `<p>${msg.message_content}</p><br/><p>Best,<br/>${bdName}</p>`,
          replyTo: bdEmail,
        }

        const response = await client.send(email)
        const messageId = response[0].headers['x-message-id']

        // Store in campaign_messages table
        await supabase
          .from('campaign_messages')
          .insert({
            campaign_id: campaignId,
            executive_id: msg.executive_id,
            executive_name: msg.executive_name,
            executive_email: msg.executive_email,
            message_content: msg.message_content,
            channel: 'email',
            status: 'sent',
            sent_at: new Date(),
            sendgrid_message_id: messageId,
          })

        results.push({ name: msg.executive_name, status: 'sent', messageId })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        results.push({ name: msg.executive_name, status: 'failed', error: errorMsg })
      }
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({
        status: 'sent',
        sent_count: results.filter(r => r.status === 'sent').length,
        started_at: new Date(),
      })
      .eq('id', campaignId)

    return Response.json({ success: true, results })
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Send failed',
    }, { status: 500 })
  }
}
