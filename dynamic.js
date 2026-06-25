document.addEventListener('DOMContentLoaded', function () {

  /* Ombre sur le menu au scroll */
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    });
  }

  /* Menu mobile (hamburger) */
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

  /* Boutons magnétiques (suivent légèrement la souris) */
  document.querySelectorAll('.btn-primary, .nav-cta').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });

  /* Apparition en cascade au scroll (IntersectionObserver, sans scroll listener) */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('in'); }, i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Compteurs animés */
  const counters = document.querySelectorAll('.stat-num, .stats div b');
  function animateCounter(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2] || '';
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * progress) + suffix;
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

  document.body.classList.add('page-loaded');

});
