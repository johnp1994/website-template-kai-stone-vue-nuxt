import './style.css';

// ===================================================
// THE GLASSPERTS - Interactive Features
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  // ---------- STICKY HEADER ----------
  const header = document.getElementById('site-header');
  const floatingCTA = document.querySelector('.floating-cta');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header?.classList.add('scrolled');
      floatingCTA?.classList.add('visible');
    } else {
      header?.classList.remove('scrolled');
      floatingCTA?.classList.remove('visible');
    }
  });

  // ---------- MOBILE MENU ----------
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');

  mobileToggle?.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mainNav?.classList.toggle('active');
  });

  // Close mobile menu on nav link click
  document.querySelectorAll('#main-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        mobileToggle?.classList.remove('active');
        mainNav?.classList.remove('active');
      }
    });
  });

  // Mobile dropdown toggle
  document.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = link.parentElement;
        parent?.classList.toggle('open');
      }
    });
  });

  // ---------- FAQ ACCORDION ----------
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement as HTMLElement;
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it wasn't active)
      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---------- REVIEWS SLIDER ----------
  const track = document.getElementById('reviews-track') as HTMLElement;
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');
  let currentSlide = 0;

  function getVisibleCards(): number {
    const w = window.innerWidth;
    if (w <= 768) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function getTotalCards(): number {
    return track?.children.length || 0;
  }

  function updateSlider() {
    if (!track) return;
    const cardWidth = (track.parentElement?.offsetWidth || 0) / getVisibleCards();
    const gap = 24;
    track.style.transform = `translateX(-${currentSlide * (cardWidth + gap)}px)`;
  }

  prevBtn?.addEventListener('click', () => {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlider();
    }
  });

  nextBtn?.addEventListener('click', () => {
    const maxSlide = getTotalCards() - getVisibleCards();
    if (currentSlide < maxSlide) {
      currentSlide++;
      updateSlider();
    }
  });

  window.addEventListener('resize', () => {
    currentSlide = 0;
    updateSlider();
  });

  // Auto-slide every 5 seconds
  setInterval(() => {
    const maxSlide = getTotalCards() - getVisibleCards();
    if (currentSlide < maxSlide) {
      currentSlide++;
    } else {
      currentSlide = 0;
    }
    updateSlider();
  }, 5000);

  // ---------- CHAT WIDGET ----------
  const chatToggle = document.getElementById('chat-toggle');
  const chatPopup = document.getElementById('chat-popup');
  const chatClose = document.getElementById('chat-close');

  chatToggle?.addEventListener('click', () => {
    chatPopup?.classList.toggle('active');
  });

  chatClose?.addEventListener('click', () => {
    chatPopup?.classList.remove('active');
  });

  // ---------- FORM SUBMISSION ----------
  const quoteForm = document.getElementById('quote-form-element') as HTMLFormElement;
  quoteForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(quoteForm);
    const data = Object.fromEntries(formData);
    console.log('Form submitted:', data);

    // Show success feedback
    const submitBtn = document.getElementById('form-submit-btn');
    if (submitBtn) {
      const orig = submitBtn.textContent;
      submitBtn.textContent = '✓ SENT!';
      submitBtn.style.background = '#22c55e';
      submitBtn.style.borderColor = '#22c55e';
      setTimeout(() => {
        submitBtn.textContent = orig;
        submitBtn.style.background = '';
        submitBtn.style.borderColor = '';
        quoteForm.reset();
      }, 2000);
    }
  });

  // ---------- SCROLL ANIMATIONS ----------
  const observerOptions: IntersectionObserverInit = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add animation classes to sections
  const animateElements = document.querySelectorAll(
    '.about-grid, .service-card, .process-step, .gallery-item, .review-card, .faq-item, .area-item, .trust-item'
  );

  animateElements.forEach((el, i) => {
    el.classList.add('animate-in');
    (el as HTMLElement).style.transitionDelay = `${i % 4 * 0.1}s`;
    observer.observe(el);
  });

  // ---------- SMOOTH SCROLL ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = (anchor as HTMLAnchorElement).getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = header?.offsetHeight || 80;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ---------- ACTIVE NAV TRACKING ----------
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const offset = section.getBoundingClientRect().top;
      if (offset < 200) {
        current = section.getAttribute('id') || '';
      }
    });

    document.querySelectorAll('#main-nav .nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
});
