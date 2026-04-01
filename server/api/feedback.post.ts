import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import path from 'path'

/**
 * POST /api/feedback
 * Receives internal feedback from the Review Funnel (for ratings 1-4).
 * Sends an email to the business owner via SMTP.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate required fields
  if (!body.rating || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating and feedback message are required.',
    })
  }

  const feedback = {
    id: crypto.randomUUID(),
    rating: body.rating,
    message: body.message,
    name: body.name || 'Anonymous',
    phone: body.phone || 'N/A',
    createdAt: new Date().toISOString(),
  }

  // Save to Internal Data File for Admin Panel
  const feedbackDbPath = path.resolve(process.cwd(), 'data', 'feedback.json')
  try {
    let existingFeedback = []
    try {
      const data = await fs.readFile(feedbackDbPath, 'utf-8')
      existingFeedback = JSON.parse(data)
    } catch (e) {
      // Create data directory if it doesn't exist yet
      const dataDir = path.resolve(process.cwd(), 'data')
      await fs.mkdir(dataDir, { recursive: true })
    }
    existingFeedback.unshift(feedback) // Put newest feedback first
    await fs.writeFile(feedbackDbPath, JSON.stringify(existingFeedback, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save feedback to internal database:', err)
  }

  // Attempt to read dynamically saved config from Admin Backend
  const configPath = path.resolve(process.cwd(), 'data', 'config.json')
  let fsConfig: any = {}
  try {
    const fileContent = await fs.readFile(configPath, 'utf-8')
    fsConfig = JSON.parse(fileContent)
  } catch (error) {
    console.log('No local config.json found for SMTP. Falling back to .env variables.')
  }

  const { smtpHost, smtpPort, smtpUser, smtpPass, businessEmail } = useRuntimeConfig()

  const finalHost = fsConfig.smtpHost || smtpHost
  const finalPort = Number(fsConfig.smtpPort || smtpPort) || 587
  const finalUser = fsConfig.smtpUser || smtpUser
  const finalPass = fsConfig.smtpPass || smtpPass
  const finalEmail = fsConfig.businessEmail || businessEmail

  if (finalHost && finalUser && finalPass && finalEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: finalHost,
        port: finalPort,
        secure: finalPort === 465, // true for 465, false for other ports
        auth: {
          user: finalUser,
          pass: finalPass,
        },
      })

      await transporter.sendMail({
        from: `"Review Funnel" <${finalUser}>`,
        to: finalEmail,
        subject: `⚠️ New Internal Feedback (${feedback.rating} Stars)`,
        html: `
          <h3>You received new feedback from the Review Funnel</h3>
          <p><strong>Name:</strong> ${feedback.name}</p>
          <p><strong>Phone:</strong> ${feedback.phone}</p>
          <p><strong>Rating:</strong> ${feedback.rating} / 5</p>
          <p><strong>Message:</strong><br/> ${feedback.message}</p>
        `,
      })
      
      console.log('📧 Email sent successfully to business owner.')
    } catch (error) {
      console.error('Failed to send email via SMTP:', error)
    }
  } else {
    // Fallback log if SMTP isn't configured yet
    console.log('⚠️ SMTP variables not configured in .env or dashboard. Skipping email send.')
    console.log('📉 New Negative Feedback Captured:', feedback)
  }

  return {
    success: true,
    data: { id: feedback.id },
  }
})
