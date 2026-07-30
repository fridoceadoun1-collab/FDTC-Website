/* ========================================
   Fridoce Design and Trade Center
   dynamic.js — Interactions & comportements
   ======================================== */

// ── 1. MENU MOBILE ──────────────────────────────────────────
(function initBurger() {
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');
  if (!burger || !navLinks) return;

  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('open');
    burger.classList.toggle('active');
  });

  // Fermer le menu quand on clique sur un lien
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      burger.classList.remove('active');
    });
  });
})();

// ── 2. SCROLL REVEAL ────────────────────────────────────────
(function initReveal() {
  const elements = document.querySelectorAll(
    '.feature-card, .testimonial-card, .service-block, .offer-card, .pack-card, .portfolio-card, .step'
  );
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });
})();

// ── 3. BOUTON WHATSAPP STICKY (apparition au scroll) ─────────
(function initStickyWhatsApp() {
  const btn = document.querySelector('.sticky-whatsapp');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
})();

// ── 4. PRÉ-REMPLISSAGE PAGE PAIEMENT depuis URL ──────────────
(function initPaymentPrefill() {
  // Vérifier qu'on est sur la page paiement
  if (!document.getElementById('paiement')) return;

  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  const montant = params.get('montant');
  const usd     = params.get('usd');

  // Récapitulatif
  const recapService = document.getElementById('recap-service');
  const recapFcfa    = document.getElementById('recap-fcfa');
  const recapUsd     = document.getElementById('recap-usd');

  if (recapService && service) {
    recapService.textContent = decodeURIComponent(service);
  }
  if (recapFcfa && montant) {
    const montantNum = parseInt(montant, 10);
    recapFcfa.textContent = montantNum.toLocaleString('fr-FR') + ' FCFA';
  }
  if (recapUsd && usd) {
    recapUsd.textContent = '≈ ' + usd + ' $';
    recapUsd.style.display = 'inline-block';
  }

  // Pré-remplir le champ montant
  const amountField = document.getElementById('payment-amount');
  if (amountField && montant) {
    amountField.value = montant;
  }

  // Pré-sélectionner le service dans le select
  const serviceSelect = document.getElementById('service-select');
  if (serviceSelect && service) {
    const decoded = decodeURIComponent(service);
    for (let opt of serviceSelect.options) {
      if (opt.value.toLowerCase().includes(decoded.toLowerCase().split('+')[0])) {
        opt.selected = true;
        break;
      }
    }
  }

  // Également pré-remplir le select du formulaire contact
  const contactService = document.getElementById('contact-service');
  if (contactService && service) {
    const decoded = decodeURIComponent(service).toLowerCase();
    for (let opt of contactService.options) {
      if (opt.value && decoded.includes(opt.value.toLowerCase().split(' ')[0])) {
        opt.selected = true;
        break;
      }
    }
  }
})();

// ── 5. BOUTON PAYER (FedaPay) ────────────────────────────────
(function initFedaPay() {
  const payBtn = document.getElementById('pay-btn');
  if (!payBtn) return;

  payBtn.addEventListener('click', () => {
    const amount  = parseInt(document.getElementById('payment-amount')?.value || '0', 10);
    const email   = document.getElementById('payment-email')?.value?.trim() || '';
    const service = document.getElementById('service-select')?.value || 'Service Fridoce';

    if (!amount || amount < 1000) {
      alert('Veuillez indiquer un montant valide (minimum 1 000 FCFA).');
      return;
    }
    if (!email || !email.includes('@')) {
      alert('Veuillez indiquer votre adresse email.');
      return;
    }

    // Tracking GA4
    if (typeof gtag === 'function') {
      gtag('event', 'begin_checkout', {
        event_category: 'conversion',
        event_label: service,
        value: amount,
        currency: 'XOF'
      });
    }

    // Initialisation FedaPay
    // eslint-disable-next-line no-undef
    FedaPay.init({
      public_key: 'pk_live_sn9Mz2n2xQALrVjJbaT08LYS',
      transaction: {
        amount: amount,
        description: service
      },
      customer: {
        email: email
      },
      onComplete: function(resp) {
        if (resp.reason === FedaPay.DIALOG_DISMISSED) return;
        if (resp.reason === FedaPay.CHECKOUT_COMPLETED) {
          if (typeof gtag === 'function') {
            gtag('event', 'purchase', {
              event_category: 'conversion',
              event_label: service,
              value: amount,
              currency: 'XOF'
            });
          }
          alert('✅ Paiement confirmé ! Je vous contacte sous 2 heures pour lancer votre projet.');
        }
      }
    }).open();
  });
})();

// ── 6. VALIDATION FORMULAIRE CONTACT ─────────────────────────
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    { el: document.getElementById('contact-name'),    err: document.getElementById('error-name'),    msg: 'Veuillez indiquer votre nom complet.' },
    phone:   { el: document.getElementById('contact-phone'),   err: document.getElementById('error-phone'),   msg: 'Veuillez indiquer votre numéro WhatsApp.' },
    message: { el: document.getElementById('contact-message'), err: document.getElementById('error-message'), msg: 'Veuillez décrire votre projet (minimum 10 caractères).' }
  };

  const successMsg     = document.getElementById('form-success');
  const errorGlobalMsg = document.getElementById('form-error-global');
  const submitBtn      = document.getElementById('contact-submit');

  function validateField(key) {
    const { el, err, msg } = fields[key];
    if (!el || !err) return true;
    const val = el.value.trim();
    let valid = val.length > 0;
    if (key === 'message') valid = val.length >= 10;
    if (!valid) {
      err.textContent = msg;
      el.classList.add('input-error');
      el.setAttribute('aria-invalid', 'true');
    } else {
      err.textContent = '';
      el.classList.remove('input-error');
      el.removeAttribute('aria-invalid');
    }
    return valid;
  }

  // Validation en temps réel
  Object.keys(fields).forEach(key => {
    const el = fields[key].el;
    if (!el) return;
    el.addEventListener('blur', () => validateField(key));
    el.addEventListener('input', () => {
      if (el.classList.contains('input-error')) validateField(key);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const allValid = Object.keys(fields).map(k => validateField(k)).every(Boolean);

    if (!allValid) {
      if (errorGlobalMsg) errorGlobalMsg.style.display = 'block';
      if (successMsg) successMsg.style.display = 'none';
      return;
    }

    // Masquer messages précédents
    if (errorGlobalMsg) errorGlobalMsg.style.display = 'none';

    // Simuler envoi (construire lien WhatsApp comme fallback)
    const name    = fields.name.el.value.trim();
    const phone   = fields.phone.el.value.trim();
    const service = document.getElementById('contact-service')?.value || 'Non précisé';
    const message = fields.message.el.value.trim();

    const waMessage = encodeURIComponent(
      `Bonjour Fridoce,\n\nJe m'appelle ${name} (${phone}).\n\nService souhaité : ${service}\n\n${message}`
    );

    // Tracking GA4
    if (typeof gtag === 'function') {
      gtag('event', 'form_submit_contact', {
        event_category: 'conversion',
        event_label: service
      });
    }

    // Afficher succès
    if (successMsg) successMsg.style.display = 'block';
    if (submitBtn) {
      submitBtn.textContent = '✅ Message envoyé !';
      submitBtn.disabled = true;
    }

    // Ouvrir WhatsApp après 1 seconde
    setTimeout(() => {
      window.open(`https://wa.me/22995250774?text=${waMessage}`, '_blank', 'noopener,noreferrer');
    }, 1000);

    // Reset formulaire après 4 secondes
    setTimeout(() => {
      form.reset();
      if (submitBtn) {
        submitBtn.textContent = 'Envoyer la demande';
        submitBtn.disabled = false;
      }
      if (successMsg) successMsg.style.display = 'none';
    }, 4000);
  });
})();

// ── 7. ONGLETS FAQ ───────────────────────────────────────────
(function initFaqTabs() {
  const tabs    = document.querySelectorAll('.faq-tab');
  const panels  = document.querySelectorAll('.faq-tab-content');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('aria-controls');

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('active');
        panel.hidden = false;
      }
    });
  });
})();

// ── 8. COUNTERS ANIMÉS (section À propos) ───────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();
      const num = parseInt(raw.replace(/\D/g, ''), 10);
      if (isNaN(num) || num === 0) return;

      const suffix = raw.replace(/[0-9]/g, '');
      let current  = 0;
      const step   = Math.ceil(num / 40);
      const timer  = setInterval(() => {
        current = Math.min(current + step, num);
        el.textContent = current + suffix;
        if (current >= num) clearInterval(timer);
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();
