'use strict';

// ── 1. NAVBAR SCROLL EFFECT ──────────────────────────────────
const navbar = document.getElementById('nav');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
}

// ── 2. MOBILE MENU DRAWER ───────────────────────────────────
const burger = document.getElementById('burger');
const mobNav = document.getElementById('mob-nav');

if (burger && mobNav) {
  burger.addEventListener('click', () => {
    const isOpen = mobNav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile nav when clicking any link
  document.querySelectorAll('.mn-link, .mn-cta').forEach(link => {
    link.addEventListener('click', () => {
      mobNav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── 3. COUNT-UP ANIMATION ────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(element, targetValue, durationMs) {
  if (!element) return;
  
  if (prefersReducedMotion) {
    element.textContent = targetValue;
    return;
  }

  let startTime = null;
  const isFloat = String(targetValue).includes('.');
  const decimals = isFloat ? (String(targetValue).split('.')[1] || '').length : 0;
  
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / durationMs, 1);
    
    // Cubic ease-out curve
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = easedProgress * targetValue;
    
    element.textContent = isFloat 
      ? currentValue.toFixed(decimals) 
      : Math.floor(currentValue);
      
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = targetValue;
    }
  };
  
  requestAnimationFrame(step);
}

// Trigger hero counters on load
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const intEl = document.getElementById('c-int');
    const projEl = document.getElementById('c-proj');
    
    if (intEl) {
      const targetInt = parseInt(intEl.getAttribute('data-to') || '2', 10);
      animateCount(intEl, targetInt, 1000);
    }
    if (projEl) {
      const targetProj = parseInt(projEl.getAttribute('data-to') || '5', 10);
      animateCount(projEl, targetProj, 1400);
    }
  }, 300);
});

// ── 4. FADE-UP INTERSECTION OBSERVER ──────────────────────────
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.05,
  rootMargin: '0px 0px -20px 0px'
});

document.querySelectorAll('.fu').forEach(element => {
  fadeObserver.observe(element);
});

// ── 5. SMOOTH IN-PAGE SCROLLING ──────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    
    e.preventDefault();
    
    const navOffset = navbar ? navbar.offsetHeight : 0;
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navOffset - 10;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });
});

// ── 6. INTERACTIVE CUSTOM CURSOR ─────────────────────────────
const cursor = document.getElementById('custom-cursor');
const cursorDot = document.getElementById('custom-cursor-dot');

const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (cursor && cursorDot && isFinePointer && !prefersReducedMotion) {
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let dotX = 0;
  let dotY = 0;
  let isInitialized = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isInitialized) {
      // Initialize immediately to prevent cursor jumping from top-left (0,0)
      ringX = mouseX;
      ringY = mouseY;
      dotX = mouseX;
      dotY = mouseY;
      isInitialized = true;
      document.body.classList.add('has-custom-cursor');
      cursor.style.opacity = '1';
      cursorDot.style.opacity = '1';
    }
  });

  // Track window entry and exit
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (isInitialized) {
      cursor.style.opacity = '1';
      cursorDot.style.opacity = '1';
    }
  });

  // Event delegation for hover states on all interactive elements
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .btn-dark, .btn-line, .proj-card, .see-all, .mn-link, [role="button"], select, input, textarea');
    if (target) {
      cursor.classList.add('cursor-hover');
      cursorDot.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .btn-dark, .btn-line, .proj-card, .see-all, .mn-link, [role="button"], select, input, textarea');
    if (target) {
      cursor.classList.remove('cursor-hover');
      cursorDot.classList.remove('cursor-hover');
    }
  });

  // Smooth frame loop using requestAnimationFrame
  const render = () => {
    if (isInitialized) {
      // Smooth interpolation ratios (0.15 for ring lag, 0.8 for responsive dot)
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      dotX += (mouseX - dotX) * 0.8;
      dotY += (mouseY - dotY) * 0.8;

      cursor.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(render);
  };
  
  requestAnimationFrame(render);
}

// ── 7. PERFORMANT SCROLLSPY & SLIDING ACTIVE INDICATOR ──────────
function initScrollspy() {
  const indicator = document.querySelector('.nav-indicator');
  const navLinks = document.querySelectorAll('.nav-center .nl');
  const mobLinks = document.querySelectorAll('.mob-nav .mn-link');
  
  if (!indicator || navLinks.length === 0) return;
  
  // Inform CSS that active indicator is loaded (hides fallback underlines)
  document.body.classList.add('has-nav-indicator');

  const targetIds = ['hero', 'about', 'projects', 'experience', 'skills', 'contact'];
  const sections = targetIds.map(id => document.getElementById(id)).filter(Boolean);

  function updateIndicator(activeLink) {
    if (activeLink) {
      indicator.style.left = `${activeLink.offsetLeft}px`;
      indicator.style.width = `${activeLink.offsetWidth}px`;
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  }

  function updateActiveLink(activeId) {
    let activeDesktopLink = null;

    // Toggle active state for desktop navbar links
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
        activeDesktopLink = link;
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle active state for mobile drawer links
    mobLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Animate/slide the underline indicator
    updateIndicator(activeDesktopLink);
  }

  // Set up IntersectionObserver to track currently viewed section
  let activeId = 'hero';
  
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -55% 0px', // Detection active zone in the upper-middle screen
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeId = entry.target.id;
      }
    });

    if (activeId === 'hero') {
      updateActiveLink(null);
    } else {
      updateActiveLink(activeId);
    }
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Recalculate indicator position on browser window resize
  window.addEventListener('resize', () => {
    const currentActiveLink = document.querySelector('.nav-center .nl.active');
    updateIndicator(currentActiveLink);
  }, { passive: true });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollspy);
} else {
  initScrollspy();
}

