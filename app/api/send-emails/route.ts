import { supabase } from '@/lib/supabase'

const sgMail = require('@sendgrid/mail')

export async function POST(request: Request) {
  try {
    const { campaignId, sendAll } = await request.json()

    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured')
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    console.log(`Sending emails. Campaign: ${campaignId}, SendAll: ${sendAll}`)

    // Get pending messages
    let query = supabase
      .from('campaign_messages')
      .select('*')
      .eq('status', 'pending')

    if (campaignId && !sendAll) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data: messages, error: fetchError } = await query

    if (fetchError) {
      throw fetchError
    }

    if (!messages || messages.length === 0) {
      return Response.json({
        success: true,
        sent: 0,
        message: 'No pending messages to send',
      })
    }

    console.log(`Found ${messages.length} pending messages`)

    let sentCount = 0
    let failedCount = 0
    const errors: any[] = []

    // Send each message
    for (const msg of messages) {
      try {
        console.log(`Sending to ${msg.executive_email}...`)

        const mailMessage = {
          to: msg.executive_email,
          from: "jay@classroomclick.com",,
          subject: 'Professional Connection',
          text: msg.message_content,
          html: `<p>${msg.message_content.replace(/\n/g, '<br>')}</p>`,
        }

        const response = await sgMail.send(mailMessage)
        console.log(`Sent to ${msg.executive_email}:`, response[0].statusCode)

        // Update message status
        await supabase
          .from('campaign_messages')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            sendgrid_message_id: response[0].headers['x-message-id'],
          })
          .eq('id', msg.id)

        sentCount++
      } catch (err) {
        console.error(`Failed to send to ${msg.executive_email}:`, err)
        failedCount++
        errors.push({
          email: msg.executive_email,
          error: err instanceof Error ? err.message : 'Unknown error',
        })

        // Update with error
        await supabase
          .from('campaign_messages')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error',
          })
          .eq('id', msg.id)
      }
    }

    // Update campaign sent count
    if (campaignId && !sendAll) {
      await supabase
        .from('campaigns')
        .update({ sent_count: sentCount })
        .eq('id', campaignId)
    }

    return Response.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent ${sentCount} emails. Failed: ${failedCount}`,
    })
  } catch (error) {
    console.error('Send email error:', error)
    return Response.json({
      error: error instanceof Error ? error.message : 'Failed to send emails',
    }, { status: 500 })
  }
}
