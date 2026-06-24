document.addEventListener('DOMContentLoaded', function () {

  /* 1. Ombre sur le menu au scroll */
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    });
  }

  /* 2. Menu mobile (hamburger) */
  const burger = document.querySelector('.nav-burger');
  const navList = document.querySelector('nav ul');
  if (burger && navList) {
    burger.addEventListener('click', function () {
      navList.classList.toggle('open');
      burger.classList.toggle('active');
    });
    navList.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navList.classList.remove('open');
        burger.classList.remove('active');
      });
    });
  }

  /* 3. Apparition en douceur au scroll */
  const revealSelectors = [
    '.promesse', '.service-row', '.port-card', '.pay-box', '#service-summary',
    '.photo-frame', '.about-grid > div', '.contact-grid > div', '.contact-grid > .contact-info',
    '.faq-item', '.hero-grid > div', '.page-head', '.section-head'
  ];
  const revealEls = document.querySelectorAll(revealSelectors.join(','));
  revealEls.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i % 6 * 70, 280) + 'ms';
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* 4. Compteurs animés (ex: 6+, 2, 100%) */
  const counters = document.querySelectorAll('.stats div b');
  function animateCounter(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2] || '';
    let current = 0;
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      current = Math.round(target * progress);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* 5. Fondu d'entrée global à l'arrivée sur la page */
  document.body.classList.add('page-loaded');

});
