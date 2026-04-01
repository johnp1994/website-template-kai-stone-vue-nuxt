import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  // 1. Verify Authentication
  const session = getCookie(event, 'admin_session')
  if (session !== 'authenticated') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized access' })
  }

  // 2. Read Feedback Database
  const feedbackDbPath = path.resolve(process.cwd(), 'data', 'feedback.json')
  
  try {
    const data = await fs.readFile(feedbackDbPath, 'utf-8')
    const feedbackList = JSON.parse(data)
    return {
      success: true,
      data: feedbackList
    }
  } catch (error) {
    // Return empty array if no feedbcak submitted yet
    return {
      success: true,
      data: []
    }
  }
})
