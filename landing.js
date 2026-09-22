/* ============================================================
   ATHLETIK — landing.js
   - FAQ accordion
   - Scroll fade-in animations
   ============================================================ */

(function () {
  'use strict';

  /* ── FAQ accordion ─────────────────────────────────────── */
  const faqButtons = document.querySelectorAll('[data-faq]');

  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');

      // Close all
      faqButtons.forEach(function (b) {
        b.classList.remove('open');
        b.nextElementSibling.style.maxHeight = '0';
      });

      // Open clicked (if it wasn't already open)
      if (!isOpen) {
        btn.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ── Scroll fade-in ─────────────────────────────────────── */
  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    const fadeEls = document.querySelectorAll('.lp-fade');

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Just make everything visible immediately
    document.querySelectorAll('.lp-fade').forEach(function (el) {
      el.classList.add('visible');
    });
  }
  

})();
