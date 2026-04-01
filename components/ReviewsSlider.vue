<template>
  <section id="reviews" class="reviews-section">
    <div class="container">
      <p class="section-label">DISCOVER WHAT OUR CUSTOMERS HAVE TO SAY ABOUT US</p>
      <h2 class="section-title center">REVIEWS<span class="title-underline center"></span></h2>
      <div class="reviews-slider" id="reviews-slider">
        <div class="reviews-track" ref="trackRef" :style="trackStyle">
          <div v-for="review in reviews" :key="review.name" class="review-card">
            <div class="review-stars">
              <i v-for="n in 5" :key="n" class="fas fa-star"></i>
            </div>
            <p class="review-text">"{{ review.text }}"</p>
            <div class="review-author">
              <div class="review-avatar"><i class="fas fa-user"></i></div>
              <div>
                <strong>{{ review.name }}</strong>
                <span>{{ review.location }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="slider-controls">
          <button class="slider-btn prev" id="reviews-prev" aria-label="Previous review" @click="prev">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="slider-btn next" id="reviews-next" aria-label="Next review" @click="next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <div class="reviews-cta">
        <NuxtLink to="/review" class="btn btn-yellow" id="rate-experience-btn">RATE YOUR EXPERIENCE</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const reviews = [
  {
    name: 'Maria G.',
    location: 'Miami, FL',
    text: 'The Glassperts did an amazing job repairing our sliding glass door. It works like new! Fast, professional, and affordable. Highly recommend.',
  },
  {
    name: 'Carlos R.',
    location: 'Kendall, FL',
    text: 'Excellent service! They replaced the rollers on my patio door and now it glides perfectly. Very knowledgeable and friendly team. Will call again.',
  },
  {
    name: 'Jennifer L.',
    location: 'Hollywood, FL',
    text: 'We had a broken window and needed quick help. The Glassperts came out the same day and fixed it. Great communication and competitive pricing.',
  },
  {
    name: 'David M.',
    location: 'Coral Gables, FL',
    text: 'Impact window installation was seamless. They handled everything professionally from start to finish. Our home feels safer now. Thank you!',
  },
]

const trackRef = ref<HTMLElement | null>(null)
const currentSlide = ref(0)
const sliderWidth = ref(0)

const getVisibleCards = (): number => {
  if (!import.meta.client) return 3
  const w = window.innerWidth
  if (w <= 768) return 1
  if (w <= 1024) return 2
  return 3
}

const maxSlide = computed(() => reviews.length - getVisibleCards())

const trackStyle = computed(() => {
  const visible = getVisibleCards()
  const cardWidth = sliderWidth.value / visible
  const gap = 24
  return {
    transform: `translateX(-${currentSlide.value * (cardWidth + gap)}px)`,
  }
})

const prev = () => {
  if (currentSlide.value > 0) currentSlide.value--
}

const next = () => {
  if (currentSlide.value < maxSlide.value) currentSlide.value++
}

let autoSlideInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const updateWidth = () => {
    sliderWidth.value = trackRef.value?.parentElement?.offsetWidth || 0
    currentSlide.value = 0
  }

  updateWidth()
  window.addEventListener('resize', updateWidth)

  // Auto-slide every 5 seconds
  autoSlideInterval = setInterval(() => {
    if (currentSlide.value < maxSlide.value) {
      currentSlide.value++
    } else {
      currentSlide.value = 0
    }
  }, 5000)

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
    if (autoSlideInterval) clearInterval(autoSlideInterval)
  })
})
</script>

<style scoped>
.reviews-section {
  padding: var(--section-padding);
  background: var(--white);
}

.reviews-slider {
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
}

.reviews-track {
  display: flex;
  gap: 24px;
  transition: transform var(--transition-slow);
}

.review-card {
  min-width: calc(33.33% - 16px);
  background: var(--gray-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--border-card);
  transition: all var(--transition-fast);
}

.review-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--gold);
}

.review-stars {
  margin-bottom: 16px;
  color: var(--gold);
  font-size: 1rem;
  display: flex;
  gap: 3px;
}

.review-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.7;
  font-style: italic;
  margin-bottom: 20px;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-circle);
  background: var(--navy);
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.review-author strong {
  display: block;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--navy);
}

.review-author span {
  font-size: 0.78rem;
  color: var(--text-light);
}

.slider-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  padding: 0 4px;
}

.slider-btn {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-circle);
  background: var(--navy);
  color: var(--white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  pointer-events: all;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.slider-btn:hover {
  background: var(--gold);
  color: var(--navy);
  transform: scale(1.1);
}

.reviews-cta {
  text-align: center;
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .review-card {
    min-width: calc(100% - 16px);
  }
}
</style>
