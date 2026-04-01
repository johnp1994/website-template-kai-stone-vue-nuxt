<template>
  <div class="review-page">
    <div class="review-outer-card">
      <transition name="fade" mode="out-in">

        <!-- Step 1: Rating Selection (GHL-style) -->
        <div v-if="state === 'rating'" key="rating" class="review-step">
          <div class="funnel-header">
            <h1 class="funnel-title">How would you rate us?</h1>
          </div>

          <div class="funnel-body">
            <div class="brand-logo-wrap">
              <img src="~/assets/images/logo.png" alt="The Glassperts" class="brand-logo" />
            </div>

            <div class="star-options" role="radiogroup" aria-label="Rating">
              <label
                v-for="option in starOptions"
                :key="option.value"
                class="star-option"
                :class="{ selected: rating === option.value }"
                @click="rating = option.value"
              >
                <input type="radio" name="rating" :value="option.value" v-model="rating" class="sr-only" />
                <span class="radio-dot" :class="{ active: rating === option.value }"></span>
                <span class="star-option-stars">
                  <i v-for="n in option.value" :key="n" class="fas fa-star"></i>
                </span>
                <span class="star-option-label">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <div class="funnel-footer">
            <button
              class="btn-next"
              :disabled="rating === 0"
              @click="handleNext"
            >
              Next <i class="fas fa-play"></i>
            </button>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width: 0%"></div>
          </div>
        </div>

        <!-- Step 2a: 5 Stars → Google Review -->
        <div v-else-if="state === 'google'" key="google" class="review-step">
          <div class="funnel-header">
            <h1 class="funnel-title">Share your experience!</h1>
          </div>
          <div class="funnel-body text-center">
            <div class="big-stars">
              <i v-for="n in 5" :key="n" class="fas fa-star"></i>
            </div>
            <p class="google-msg">We're thrilled you had a great experience! Your review on Google helps families in South Florida find trusted glass repair.</p>
            <a
              :href="googleReviewUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-google"
              id="google-review-link"
            >
              <i class="fab fa-google"></i> Leave a Google Review
            </a>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width: 50%"></div>
          </div>
        </div>

        <!-- Step 2b: 1-4 Stars → Internal Feedback Form -->
        <div v-else-if="state === 'feedback'" key="feedback" class="review-step">
          <div class="funnel-header">
            <h1 class="funnel-title">Tell us more</h1>
          </div>
          <div class="funnel-body">
            <p class="feedback-intro">We appreciate your feedback. Please share a bit more about your experience so we can continue to improve.</p>
            <form @submit.prevent="submitFeedback" class="feedback-form">
              <div class="form-group">
                <label for="feedback-msg">Your Comments <span class="req">*</span></label>
                <textarea
                  id="feedback-msg"
                  v-model="feedbackData.message"
                  rows="4"
                  placeholder="What could we have done better?"
                  required
                ></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="fb-name">Name <span class="optional">(Optional)</span></label>
                  <input type="text" id="fb-name" v-model="feedbackData.name" placeholder="Your name" />
                </div>
                <div class="form-group">
                  <label for="fb-phone">Phone <span class="optional">(Optional)</span></label>
                  <input type="tel" id="fb-phone" v-model="feedbackData.phone" placeholder="(555) 555-5555" />
                </div>
              </div>
              <button type="submit" class="btn-submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
              </button>
            </form>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width: 50%"></div>
          </div>
        </div>

        <!-- Final: Thank You -->
        <div v-else-if="state === 'done'" key="done" class="review-step text-center">
          <div class="funnel-body">
            <div class="done-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h1 class="funnel-title">Thank you!</h1>
            <p class="done-msg">Your feedback means a lot to us. We'll use it to make every experience better.</p>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width: 100%"></div>
          </div>
        </div>

      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const rating = ref(0)
const state = ref<'rating' | 'google' | 'feedback' | 'done'>('rating')
const isSubmitting = ref(false)

const googleReviewUrl = ref('https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID_HERE')

const starOptions = [
  { value: 5, label: '(5 Stars)' },
  { value: 4, label: '(4 Stars)' },
  { value: 3, label: '(3 Stars)' },
  { value: 2, label: '(2 Stars)' },
  { value: 1, label: '(1 Star)' },
]

const feedbackData = reactive({
  rating: 0,
  message: '',
  name: '',
  phone: '',
})

const route = useRoute()
onMounted(() => {
  if (route.query.name) feedbackData.name = route.query.name as string
  if (route.query.phone) feedbackData.phone = route.query.phone as string
})

const handleNext = () => {
  feedbackData.rating = rating.value
  if (rating.value === 5) {
    state.value = 'google'
  } else {
    state.value = 'feedback'
  }
}

const submitFeedback = async () => {
  if (isSubmitting.value || !feedbackData.message) return
  isSubmitting.value = true
  try {
    await $fetch('/api/feedback', { method: 'POST', body: feedbackData })
  } catch (e) {
    console.error('Feedback error:', e)
  } finally {
    isSubmitting.value = false
    state.value = 'done'
  }
}

useHead({
  title: 'Rate Your Experience | The Glassperts',
  meta: [
    { name: 'robots', content: 'noindex' },
    { name: 'description', content: 'Share your experience with The Glassperts.' }
  ]
})
</script>

<style scoped>
/* ── Page Wrapper ── */
.review-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 40px 16px;
}

/* ── Outer Card (GHL golden border style) ── */
.review-outer-card {
  width: 100%;
  max-width: 560px;
  border: 2px solid var(--gold);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

/* ── Step Container ── */
.review-step {
  background: var(--navy);
  display: flex;
  flex-direction: column;
}

/* ── Header Bar ── */
.funnel-header {
  background: var(--navy);
  padding: 28px 32px 20px;
  text-align: center;
}

.funnel-title {
  color: var(--white);
  font-family: var(--font-heading);
  font-size: 1.6rem;
  margin: 0;
}

/* ── Body ── */
.funnel-body {
  background: var(--white);
  padding: 32px;
}

.text-center {
  text-align: center;
}

/* ── Brand Logo ── */
.brand-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}

.brand-logo {
  width: 140px;
  height: 140px;
  object-fit: contain;
  border-radius: 50%;
  border: 3px solid var(--border-card);
}

/* ── Radio Star Options ── */
.star-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.star-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.star-option:hover {
  background: rgba(11, 29, 58, 0.06);
}

.star-option.selected {
  background: rgba(11, 29, 58, 0.08);
}

.radio-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #aaa;
  flex-shrink: 0;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
}

.radio-dot.active {
  border-color: var(--navy);
  background: var(--navy);
  box-shadow: inset 0 0 0 3px white;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
}

.star-option-stars {
  display: flex;
  gap: 3px;
  color: var(--gold);
  font-size: 1.1rem;
}

.star-option-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* ── Footer / Next Button ── */
.funnel-footer {
  background: #1a1a2e;
  padding: 14px 32px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.btn-next {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--white);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.2s;
}

.btn-next:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-next i {
  font-size: 0.75rem;
}

/* ── Progress Bar ── */
.progress-bar-wrap {
  height: 6px;
  background: #dde3eb;
}

.progress-bar {
  height: 100%;
  background: var(--gold);
  transition: width 0.5s ease;
}

/* ── Google State ── */
.big-stars {
  font-size: 2.4rem;
  color: var(--gold);
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.google-msg {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 24px;
}

.btn-google {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #4285f4;
  color: white;
  padding: 14px 28px;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 15px rgba(66, 133, 244, 0.35);
}

.btn-google:hover {
  background: #3367d6;
  transform: translateY(-2px);
}

/* ── Feedback Form ── */
.feedback-intro {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 20px;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--navy);
}

.optional {
  font-weight: 400;
  color: #999;
}

.req {
  color: crimson;
}

.form-group textarea,
.form-group input {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--navy);
  transition: border-color 0.2s;
}

.form-group textarea:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--navy);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-submit {
  background: var(--gold);
  color: var(--navy);
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-submit:hover {
  background: #e6a900;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ── Done State ── */
.done-icon {
  font-size: 4rem;
  color: #22c55e;
  margin-bottom: 16px;
}

.done-msg {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ── Mobile ── */
@media (max-width: 480px) {
  .funnel-body { padding: 24px 20px; }
  .funnel-header { padding: 20px 20px 16px; }
  .form-row { grid-template-columns: 1fr; }
  .brand-logo { width: 110px; height: 110px; }
}
</style>
