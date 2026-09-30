(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  let chosenTheme;
  try { chosenTheme = localStorage.getItem('nf-theme'); } catch { /* Theme still works when storage is unavailable. */ }
  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#181818' : '#fcfcfc';
  }
  applyTheme(['light', 'dark'].includes(chosenTheme) ? chosenTheme : (themeMedia.matches ? 'dark' : 'light'));
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    chosenTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(chosenTheme);
    try { localStorage.setItem('nf-theme', chosenTheme); } catch { /* Storage is optional. */ }
  });
  themeMedia.addEventListener('change', event => {
    if (!['light', 'dark'].includes(chosenTheme)) applyTheme(event.matches ? 'dark' : 'light');
  });

  const viewButtons = [...document.querySelectorAll('[data-view]')];
  function selectView(view) {
    if (!['product', 'system'].includes(view)) return;
    viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    document.getElementById('product-view').hidden = view !== 'product';
    document.getElementById('system-view').hidden = view !== 'system';
  }
  viewButtons.forEach(button => button.addEventListener('click', () => selectView(button.dataset.view)));

  const workflows = {
    booking: {
      label: '01 / Scheduling',
      description: 'Booking APIs check availability, service eligibility and slot conflicts. Firestore transactions enforce scheduling constraints when a booking is written.'
    },
    payment: {
      label: '02 / Payments',
      description: 'Stripe deposits use signature-verified webhooks and duplicate-booking safeguards. Idempotent refunds account for payment retries and booking conflicts.'
    },
    access: {
      label: '03 / Access',
      description: 'Server-side membership, role and location checks determine which store data a person can access. Authorization-policy tests exercise these boundaries.'
    }
  };
  const flowButtons = [...document.querySelectorAll('[data-flow]')];
  function selectFlow(flow) {
    const content = workflows[flow];
    if (!content) return;
    flowButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.flow === flow)));
    document.querySelectorAll('[data-service]').forEach(service => service.classList.toggle('is-highlighted', service.dataset.service === flow));
    document.getElementById('flow-label').textContent = content.label;
    document.getElementById('flow-description').textContent = content.description;
  }
  flowButtons.forEach(button => button.addEventListener('click', () => selectFlow(button.dataset.flow)));
  function arrowNavigation(buttons) {
    buttons.forEach((button, index) => button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      buttons[next].click();
    }));
  }
  arrowNavigation(viewButtons);
  arrowNavigation(flowButtons);

  if ('IntersectionObserver' in window) {
    const navigation = [...document.querySelectorAll('.main-nav a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navigation.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-12% 0px -65% 0px' });
    document.querySelectorAll('#work, #journey, #workbench, #top, #contact').forEach(section => observer.observe(section));
  }
})();
