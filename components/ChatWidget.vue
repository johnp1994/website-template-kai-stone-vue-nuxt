<template>
  <div class="chat-widget-container">
    <!-- Chat Toggle Bubble -->
    <button v-if="!isOpen" @click="isOpen = true" class="chat-bubble" aria-label="Open Chat">
      <div class="bubble-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10898 20.6391 10.5124 21 12 21Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </button>

    <!-- Chat Popup Window -->
    <div v-show="isOpen" class="chat-popup">
      <!-- Header (Navy) -->
      <div class="chat-header">
        <div class="header-left">
          <img src="~/assets/images/logo.png" alt="Logo" class="header-logo" />
          <span class="header-text">Let us know if you have any questions!</span>
        </div>
        <button @click="isOpen = false" class="close-btn" aria-label="Close Chat">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="chat-body" ref="chatBodyRef">
        <!-- Lead Message Bubble -->
        <div class="bot-msg-wrap" v-if="!isLeadCaptured">
          <img src="~/assets/images/logo.png" alt="Bot Logo" class="bot-avatar" />
          <div class="bot-msg">
            This Text goes straight to my personal phone. I will make sure to get back to you the second I'm free!
          </div>
        </div>

        <!-- Initial FORM State -->
        <div v-if="!isLeadCaptured" class="lead-form-container">
          <div class="lead-form">
            <div class="input-group">
              <input v-model="leadForm.name" type="text" placeholder="Name *" required />
            </div>
            <div class="input-group phone-input">
              <div class="flag-icon"><span class="flag-us">🇺🇸</span> <i class="fas fa-caret-down"></i></div>
              <input v-model="leadForm.phone" type="tel" placeholder="Phone *" required />
            </div>
            <div class="input-group">
              <textarea v-model="leadForm.message" placeholder="I want to know more" rows="3"></textarea>
            </div>
          </div>
          <div class="consent-box">
            <label class="checkbox-label">
              <input type="checkbox" v-model="leadForm.consent" checked />
              <span class="checkmark"></span>
              By submitting you agree to receive SMS or e-mails for the provided channel. Rates may be applied.
            </label>
          </div>
          <button @click="handleLeadSubmit" class="btn-send-lead" :disabled="isSending">
            {{ isSending ? 'Sending...' : 'Send :)' }} <i class="fas fa-paper-plane"></i>
          </button>
        </div>

        <!-- CHAT HISTORY State -->
        <div v-else class="chat-history">
          <div v-for="(msg, index) in messages" :key="index" :class="['message-wrap', msg.role]">
            <img v-if="msg.role === 'bot'" src="~/assets/images/logo.png" alt="Bot Logo" class="bot-avatar" />
            <div class="message-bubble">{{ msg.text }}</div>
          </div>
          <div v-if="isTyping" class="message-wrap bot typing">
            <img src="~/assets/images/logo.png" alt="Bot Logo" class="bot-avatar" />
            <div class="message-bubble">...</div>
          </div>
        </div>
      </div>

      <!-- Footer Input (Only visible after lead is captured) -->
      <div v-if="isLeadCaptured" class="chat-footer">
        <input 
          v-model="currentMessage" 
          @keyup.enter="handleUserChat" 
          type="text" 
          placeholder="Ask a follow-up question..." 
          :disabled="isSending || totalSent >= 5"
        />
        <button @click="handleUserChat" :disabled="isSending || totalSent >= 5">
          <i class="fas fa-paper-plane"></i>
        </button>
        <div v-if="totalSent >= 5" class="limit-warning">Message limit reached for this session.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
const isLeadCaptured = ref(false)
const isSending = ref(false)
const isTyping = ref(false)
const totalSent = ref(0)
const sessionId = ref(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
const chatBodyRef = ref<HTMLElement | null>(null)

const leadForm = reactive({
  name: '',
  phone: '',
  message: '',
  consent: true
})

const messages = ref<any[]>([])
const currentMessage = ref('')

const webhookUrl = 'https://primary-production-55e84.up.railway.app/webhook/d078abf0-ba5e-4eaa-a155-032f00233774/chat'

// Site Knowledge Context to inject once
const siteKnowledge = `
Business Name: The Glassperts
Founder: Manny Vega (Family-owned since 2007, Manny started his career at 16).
Availability: Open 24/7 for emergency sliding door and window repairs across South Florida.

Primary Services: 
1. Sliding Glass Door Repair (Expertise in tracks, rollers, and locks).
2. Window Glass Repair (Fixes for cracked/damaged glass for clarity and insulation).
3. Commercial Glass (Professional storefront and office glass services).
4. Impact Windows & Doors (Durable installation for hurricane safety).

Service Areas (South Florida): 
Miami, Kendall, Coral Gables, Homestead, Pinecrest, Miami Lakes, Miami Beach, Hollywood, Cutler Bay, Cutler Ridge.

How It Works: 
1. Contact Us (24/7 via phone or chat form).
2. Free Estimate (No-obligation).
3. Professional Repair (Experienced technicians).
4. Complete!

Company Promise: Over 23 years of industry experience. Family-owned, reliable, and committed to South Florida residents.
`.trim()

const handleLeadSubmit = async () => {
  if (!leadForm.name || !leadForm.phone || !leadForm.message) return
  isSending.value = true
  
  // Prepare first message with data injection
  const initialText = `NEW LEAD: Name: ${leadForm.name}, Phone: ${leadForm.phone}. Question: ${leadForm.message}`
  
  // Add to UI
  messages.value.push({ role: 'user', text: leadForm.message })
  isLeadCaptured.value = true
  totalSent.value++
  
  try {
    isTyping.value = true
    const response: any = await $fetch(webhookUrl, {
      method: 'POST',
      body: {
        action: 'sendMessage',
        sessionId: sessionId.value,
        chatInput: initialText,
        metadata: {
          name: leadForm.name,
          phone: leadForm.phone,
          site_knowledge: siteKnowledge
        }
      }
    })
    
    if (response) {
      messages.value.push({ role: 'bot', text: response.output || response.text || "Thanks! Someone will contact you shortly." })
    }
  } catch (e) {
    console.error('Chat error:', e)
    messages.value.push({ role: 'bot', text: "Thanks for the info! We've received your request and will reach out to you." })
  } finally {
    isSending.value = false
    isTyping.value = false
    scrollToBottom()
  }
}

const handleUserChat = async () => {
  if (!currentMessage.value.trim() || totalSent.value >= 5 || isSending.value) return
  
  const text = currentMessage.value.trim()
  currentMessage.value = ''
  messages.value.push({ role: 'user', text })
  totalSent.value++
  isSending.value = true
  
  try {
    isTyping.value = true
    const response: any = await $fetch(webhookUrl, {
      method: 'POST',
      body: {
        action: 'sendMessage',
        sessionId: sessionId.value,
        chatInput: text
      }
    })
    
    if (response) {
      messages.value.push({ role: 'bot', text: response.output || response.text || "I'm still learning. Try contacting us!" })
    }
  } catch (e) {
    console.error('Chat error:', e)
  } finally {
    isSending.value = false
    isTyping.value = false
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.chat-widget-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  font-family: var(--font-body), sans-serif;
}

/* Bubble */
.chat-bubble {
  width: 60px;
  height: 60px;
  background: #00bcd4;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.chat-bubble:hover { transform: scale(1.05); }
.bubble-icon { width: 30px; height: 30px; }

/* Popup */
.chat-popup {
  width: 360px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.chat-header {
  background: #0b1d3a;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.header-logo { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #00bcd4; padding: 2px; background: white; }
.header-text { color: white; font-size: 0.95rem; font-weight: 600; line-height: 1.2; font-family: var(--font-heading); }
.close-btn { background: none; border: none; color: white; cursor: pointer; font-size: 1.1rem; }

/* Body */
.chat-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  background: #f8f9fa;
  min-height: 350px;
  max-height: 500px;
}

.bot-msg-wrap { display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start; }
.bot-avatar { width: 28px; height: 28px; border-radius: 50%; background: #0b1d3a; padding: 2px; }
.bot-msg { background: #f0f2f5; padding: 12px 16px; border-radius: 12px 12px 12px 4px; color: #333; font-size: 0.88rem; line-height: 1.4; border: 1px solid #e1e4e8; }

/* Lead Form */
.lead-form-container { background: white; padding: 16px; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.lead-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.input-group input, .input-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; font-family: inherit; transition: border-color 0.2s; }
.input-group input:focus, .input-group textarea:focus { outline: none; border-color: #00bcd4; }
.phone-input { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 8px; padding-left: 10px; }
.phone-input input { border: none; padding-left: 8px; }
.flag-icon { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #666; }

.consent-box { margin-bottom: 16px; min-height: 48px; background: #f0f2f5; padding: 10px; border-radius: 8px; }
.checkbox-label { display: flex; gap: 10px; font-size: 0.75rem; color: #555; align-items: flex-start; cursor: pointer; }
.checkbox-label input { margin-top: 2px; accent-color: #00bcd4; }

.btn-send-lead { width: 100%; background: #00bcd4; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: 700; font-family: var(--font-heading); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
.btn-send-lead:hover { background: #00a4bd; }

/* Chat History */
.chat-history { display: flex; flex-direction: column; gap: 16px; }
.message-wrap { display: flex; gap: 8px; align-items: flex-end; }
.message-wrap.user { justify-content: flex-end; padding-left: 40px; }
.message-wrap.bot { justify-content: flex-start; padding-right: 40px; }
.message-bubble { padding: 10px 14px; border-radius: 16px; font-size: 0.88rem; line-height: 1.4; max-width: 100%; }
.user .message-bubble { background: #00bcd4; color: white; border-radius: 16px 16px 4px 16px; }
.bot .message-bubble { background: white; color: #333; border: 1px solid #e1e4e8; border-radius: 16px 16px 16px 4px; }

/* Footer */
.chat-footer { padding: 12px 16px; border-top: 1px solid #eee; display: flex; align-items: center; gap: 10px; background: white; }
.chat-footer input { flex: 1; border: none; font-size: 0.9rem; padding: 8px; }
.chat-footer input:focus { outline: none; }
.chat-footer button { background: none; border: none; color: #00bcd4; cursor: pointer; font-size: 1.2rem; }
.limit-warning { position: absolute; bottom: 100%; left: 0; right: 0; background: rgba(0,0,0,0.8); color: white; font-size: 0.75rem; text-align: center; padding: 4px; }

@media (max-width: 480px) {
  .chat-popup { width: calc(100vw - 48px); }
}
</style>
