// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_swydt8b';
const EMAILJS_TEMPLATE_ID = 'template_v7ywqa8';
const EMAILJS_PUBLIC_KEY = 'zue0TwvrYFugZfFcX';

(() => {
  // Utility selectors
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Local state
  let defaults = {};

  // Elements (will be resolved during init)
  let envelope;
  let openLetterButton;
  let yesButton;
  let noButton;
  let responseLine;
  let choiceActions;
  let editorForm;
  let copyLinkButton;
  let resetFormButton;
  let saveTextButton;
  let copyStatus;
  let boundNodes = [];

  function guard(el) {
    return Boolean(el);
  }

  function disableAllFormInputs() {
    if (!editorForm) return;
    qsa('input, textarea, button', editorForm).forEach((el) => (el.disabled = true));
    editorForm.style.pointerEvents = 'none';
    editorForm.style.opacity = '0.5';
  }

  function readFormValues() {
    if (!editorForm) return {};
    return Object.fromEntries(new FormData(editorForm).entries());
  }

  function applyContent(values = {}) {
    boundNodes.forEach((node) => {
      const key = node.dataset.bind;
      if (!key || !(key in values)) return;
      node.textContent = values[key];
    });
  }

  function updatePreview() {
    applyContent(readFormValues());
  }

  function saveToLocalStorage() {
    const values = readFormValues();
    localStorage.setItem('apologySiteData', JSON.stringify(values));
    if (copyStatus) copyStatus.textContent = '✓ Text saved permanently!';
    setTimeout(() => {
      if (copyStatus) copyStatus.textContent = 'Live preview is active.';
    }, 2000);
  }

  function loadFromLocalStorage() {
    if (!editorForm) return;
    const saved = localStorage.getItem('apologySiteData');
    if (!saved) return;
    try {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([key, value]) => {
        const field = editorForm.elements.namedItem(key);
        if (field) field.value = value;
      });
      updatePreview();
    } catch (e) {
      console.error('Failed to parse saved content', e);
    }
  }

  function resetForm() {
    if (!editorForm) return;
    Object.entries(defaults).forEach(([key, value]) => {
      const field = editorForm.elements.namedItem(key);
      if (field) field.value = value;
    });
    updatePreview();
    if (copyStatus) copyStatus.textContent = 'Reset to the original text.';
    history.replaceState({}, '', window.location.pathname);
  }

  async function copyCustomLink() {
    if (!editorForm || !copyStatus) return;
    const params = new URLSearchParams();
    const values = readFormValues();
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== defaults[key]) params.set(key, value);
    });

    if (window.location.protocol === 'file:') {
      copyStatus.textContent = 'Open this page through localhost before copying a link.';
      return;
    }

    const baseUrl = window.location.href.split('?')[0];
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    try {
      await navigator.clipboard.writeText(url);
      copyStatus.textContent = 'Custom link copied. Send that version.';
    } catch (err) {
      copyStatus.textContent = 'Could not access clipboard. Copy the URL from the address bar after saving the text.';
    }
  }

  function openLetter() {
    if (!envelope) return;
    envelope.classList.add('open');
    const letter = qs('#letter');
    if (letter) letter.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function closeLetter() {
    if (!envelope) return;
    envelope.classList.remove('open');
  }

  function moveNoButton() {
    if (!noButton || !choiceActions || !responseLine) return;
    if (window.innerWidth < 640) {
      responseLine.textContent = 'I will take the hint, but my apology is still sincere.';
      return;
    }
    const bounds = choiceActions.getBoundingClientRect();
    const maxX = Math.max(0, bounds.width - noButton.offsetWidth - 8);
    const maxY = 48;
    const nextX = Math.random() * maxX;
    const nextY = Math.random() * maxY - maxY / 2;
    noButton.style.transform = `translate(${nextX}px, ${nextY}px)`;
    responseLine.textContent = 'That button has main-character energy. The apology is still real.';
  }

  async function sendNotificationEmail() {
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      console.warn('EmailJS not configured. Please add your credentials to script.js');
      return;
    }

    try {
      // emailjs is loaded via CDN in the page
      emailjs.init(EMAILJS_PUBLIC_KEY);
      const recipientNameNode = qs('[data-bind="recipientName"]');
      const recipientName = recipientNameNode ? recipientNameNode.textContent : '';
      const now = new Date().toLocaleString();
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: 'harrypx20@gmail.com',
        recipient_name: recipientName,
        timestamp: now,
      });
      console.log('Notification email sent!');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  function attachHandlers() {
    if (openLetterButton) openLetterButton.addEventListener('click', openLetter);
    if (editorForm) editorForm.addEventListener('input', updatePreview);
    if (copyLinkButton) copyLinkButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (copyStatus) copyStatus.textContent = 'This is a read-only view. You cannot edit or copy links.';
    });
    if (resetFormButton) resetFormButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (copyStatus) copyStatus.textContent = 'This is a read-only view. You cannot reset the form.';
    });
    if (saveTextButton) saveTextButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (copyStatus) copyStatus.textContent = 'This is a read-only view. You cannot save changes.';
    });

    if (yesButton) {
      yesButton.addEventListener('click', async () => {
        openLetter();
        if (responseLine) responseLine.textContent = 'Thank you. I will make the next scene gentler, steadier, and real.';
        if (yesButton) yesButton.textContent = 'I mean every word';
        if (noButton) noButton.style.transform = 'translate(0, 0)';
        await sendNotificationEmail();
      });
    }

    if (noButton) {
      noButton.addEventListener('mouseenter', moveNoButton);
      noButton.addEventListener('click', moveNoButton);
    }
   
    let lastSpawn = 0;
    const SPAWN_COOLDOWN = 80; 
    document.addEventListener('click', (ev) => {
      const now = Date.now();
      if (now - lastSpawn < SPAWN_COOLDOWN) return;
      lastSpawn = now;
      spawnFlower(ev.clientX, ev.clientY);
    });

    // Close the letter when the user scrolls down
    let lastScrollY = window.scrollY || 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY || 0;
      // only react to meaningful downward scrolls
      if (y - lastScrollY > 10) {
        if (envelope && envelope.classList.contains('open')) closeLetter();
      }
      lastScrollY = y;
    }, { passive: true });
  }

  // Create a small flower element (emoji) at the given viewport coordinates
  function spawnFlower(clientX, clientY) {
    const el = document.createElement('span');
    el.className = 'cursor-flower';
    // pick a gentle flower emoji (rotating through a few for variety)
    const variants = ['🌸', '💐', '🌷', '🌺'];
    el.textContent = variants[Math.floor(Math.random() * variants.length)];
    document.body.appendChild(el);
    el.style.left = `${clientX}px`;
    el.style.top = `${clientY}px`;

    // allow style to apply, then trigger the pop animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('pop'));
    });

    // remove after animation
    setTimeout(() => el.remove(), 700);
  }

  function applyQueryParams() {
    if (!editorForm || !copyStatus) return;
    const params = new URLSearchParams(window.location.search);
    let hasCustomContent = false;
    Object.keys(defaults).forEach((key) => {
      const value = params.get(key);
      if (!value) return;
      const field = editorForm.elements.namedItem(key);
      if (field) {
        field.value = value;
        hasCustomContent = true;
      }
    });
    if (hasCustomContent && copyStatus) copyStatus.textContent = 'Loaded from a custom link.';
  }

  function init() {
    // resolve elements
    envelope = qs('#envelope');
    openLetterButton = qs('#open-letter');
    yesButton = qs('#yes-btn');
    noButton = qs('#no-btn');
    responseLine = qs('#response-line');
    choiceActions = qs('#choice-actions');
    editorForm = qs('#editor-form');
    copyLinkButton = qs('#copy-link');
    resetFormButton = qs('#reset-form');
    saveTextButton = qs('#save-text');
    copyStatus = qs('#copy-status');
    boundNodes = qsa('[data-bind]');

    if (editorForm) {
      defaults = Object.fromEntries(new FormData(editorForm).entries());
    }

    loadFromLocalStorage();
    applyQueryParams();
    updatePreview();
    disableAllFormInputs();
    attachHandlers();

    // show notification banner subtle reveal
    const notificationBanner = qs('.notification-banner');
    if (notificationBanner) setTimeout(() => (notificationBanner.style.opacity = '0.9'), 100);

    setTimeout(() => {
      if (responseLine) responseLine.textContent = 'If you are still reading, that already means more than you know.';
    }, 1200);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
