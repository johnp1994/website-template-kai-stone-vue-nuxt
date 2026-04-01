<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <img src="~/assets/images/logo.png" alt="The Glassperts" class="dashboard-logo" />
        <h1>Admin Settings</h1>
      </div>
      <button @click="logout" class="btn btn-outline-light btn-sm">Sign Out</button>
    </div>

    <div class="dashboard-body">
      <div class="settings-card">
        <h2>Review Funnel Email Settings</h2>
        <p class="settings-desc">Configure where the 1-4 star negative feedback is sent. Updates made here affect the live site immediately.</p>
        
        <form @submit.prevent="saveSettings" class="settings-form">
          <div class="form-section">
            <h3 class="section-title">Admin Identity</h3>
            <div class="form-group">
              <label for="adminEmail">Admin Login Email (Used to sign in)</label>
              <input type="email" id="adminEmail" v-model="form.adminEmail" placeholder="admin@glassexpertsfl.org" required />
            </div>
            <div class="form-group">
              <p class="help-text">
                Password changes must be done via the <NuxtLink to="/admin/forgot-password" style="color:var(--gold);">Forgot Password</NuxtLink> flow on the login screen.
              </p>
            </div>
          </div>

          <hr class="divider" />

          <div class="form-section">
            <h3 class="section-title">SMTP Server Settings</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="smtpUser">Gmail Account Address</label>
                <input type="email" id="smtpUser" v-model="form.smtpUser" placeholder="e.g. alerts@company.com" required />
              </div>
              <div class="form-group">
                <label for="smtpPass">Gmail App Password</label>
                <input type="password" id="smtpPass" v-model="form.smtpPass" placeholder="Enter 16-digit App Password..." required />
                <p class="help-text" style="font-size:0.75rem; margin-top:4px;">Requires a <a href="https://myaccount.google.com/apppasswords" target="_blank" style="color:var(--gold);">Google App Password</a></p>
              </div>
            </div>

            <div class="form-group">
              <label for="businessEmail">Destination Email (Who receives the alerts?)</label>
              <input type="email" id="businessEmail" v-model="form.businessEmail" placeholder="e.g. boss@theglassperts.com" required />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-yellow" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Settings' }}
            </button>
            <p v-if="successMsg" class="success-text">{{ successMsg }}</p>
            <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
          </div>
        </form>
      </div>

      <!-- Internal Feedback Section -->
      <div class="feedback-section">
        <h2 class="feedback-heading">Recent Customer Feedback</h2>
        <p class="settings-desc">Review internal feedback submitted via the 1-4 rating funnel.</p>
        
        <div v-if="isLoadingFeedbacks" class="feedback-loading">
          Loading feedback...
        </div>
        <div v-else-if="feedbacks.length === 0" class="feedback-empty">
          No feedback received yet.
        </div>
        <div v-else class="feedback-list">
          <div v-for="item in feedbacks" :key="item.id" class="feedback-card">
            <div class="feedback-card-header">
              <div class="feedback-stars">
                <i v-for="n in item.rating" :key="n" class="fas fa-star gold-star"></i>
                <i v-for="n in (5 - item.rating)" :key="'empty-'+n" class="far fa-star empty-star"></i>
                <span class="rating-number">{{ item.rating }}/5</span>
              </div>
              <span class="feedback-date">{{ new Date(item.createdAt).toLocaleDateString() }}</span>
            </div>
            
            <p class="feedback-message">"{{ item.message }}"</p>
            
            <div class="feedback-contact">
              <div class="contact-item">
                <i class="fas fa-user"></i> {{ item.name }}
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i> {{ item.phone }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin-auth' // Enforce auth
})

useHead({
  title: 'Dashboard | The Glassperts'
})

const router = useRouter()
const isSaving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

// Feedback refs
const feedbacks = ref<any[]>([])
const isLoadingFeedbacks = ref(true)

const form = reactive({
  adminEmail: 'admin@glassexpertsfl.org',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  businessEmail: ''
})

// Load Config and Feedbacks on Mount
onMounted(async () => {
  try {
    const res = await $fetch('/api/admin/config')
    if (res.success && res.data) {
      if (res.data.adminEmail) form.adminEmail = res.data.adminEmail
      if (res.data.smtpHost) form.smtpHost = res.data.smtpHost
      if (res.data.smtpPort) form.smtpPort = res.data.smtpPort
      form.smtpUser = res.data.smtpUser
      form.smtpPass = res.data.smtpPass
      form.businessEmail = res.data.businessEmail
    }
  } catch (err: any) {
    if (err.statusCode === 401) {
      router.push('/admin/login')
      return // Don't proceed to fetching feedbacks if unauthorized
    } else {
      errorMsg.value = 'Failed to load configuration.'
    }
  }

  // Fetch Feedbacks
  try {
    isLoadingFeedbacks.value = true
    const fbRes = await $fetch('/api/admin/feedback')
    if (fbRes.success) {
      feedbacks.value = fbRes.data
    }
  } catch(err) {
    console.error('Failed to load feedbacks', err)
  } finally {
    isLoadingFeedbacks.value = false
  }
})

const saveSettings = async () => {
  isSaving.value = true
  successMsg.value = ''
  errorMsg.value = ''

  // Enforce Gmail defaults since UI fields are hidden
  form.smtpHost = 'smtp.gmail.com'
  form.smtpPort = 587

  try {
    const res = await $fetch('/api/admin/config', {
      method: 'POST',
      body: form
    })
    
    if (res.success) {
      successMsg.value = 'Settings successfully saved!'
      setTimeout(() => successMsg.value = '', 4000)
    }
  } catch (error) {
    console.error(error)
    errorMsg.value = 'There was an error saving the configuration.'
  } finally {
    isSaving.value = false
  }
}

const logout = async () => {
  await $fetch('/api/admin/logout', { method: 'POST' })
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: var(--font-body);
}

.dashboard-header {
  background: var(--navy);
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dashboard-logo {
  height: 40px;
}

.dashboard-header h1 {
  color: var(--white);
  font-family: var(--font-heading);
  font-size: 1.25rem;
  margin: 0;
}

.dashboard-body {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  background: var(--navy);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-xl);
  margin-bottom: 40px;
}

.settings-card h2 {
  color: var(--white);
  font-family: var(--font-heading);
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.settings-desc {
  color: var(--text-white-faded);
  margin-bottom: 32px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  color: var(--gold);
  font-size: 1.1rem;
  margin-bottom: 4px;
  font-family: var(--font-heading);
}

.divider {
  border: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
}

.help-text {
  color: var(--text-white-faded);
  font-size: 0.85rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  color: var(--text-white-faded);
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--white);
  transition: all var(--transition-fast);
}

.form-group input:focus {
  outline: none;
  border-color: var(--gold);
}

.form-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.success-text {
  color: var(--success);
  font-weight: 600;
}

.error-text {
  color: #ff4d4f;
  font-weight: 600;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.85rem;
}

/* Feedback Section styling */
.feedback-section {
  margin-top: 48px;
}

.feedback-heading {
  color: var(--white);
  font-family: var(--font-heading);
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.feedback-loading,
.feedback-empty {
  background: var(--navy);
  padding: 32px;
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--text-white-faded);
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-card {
  background: var(--navy);
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-xl);
}

.feedback-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.feedback-stars {
  font-size: 0.95rem;
}

.gold-star {
  color: var(--gold);
  margin-right: 2px;
}

.empty-star {
  color: rgba(255, 255, 255, 0.2);
  margin-right: 2px;
}

.rating-number {
  color: var(--white);
  margin-left: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.feedback-date {
  color: var(--text-white-faded);
  font-size: 0.85rem;
}

.feedback-message {
  color: var(--text-white-dim);
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 20px;
}

.feedback-contact {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--white);
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 6px;
}

.contact-item i {
  color: var(--gold);
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .dashboard-body {
    padding: 20px;
  }
}
</style>
