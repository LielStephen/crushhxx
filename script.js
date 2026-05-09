// EmailJS Configuration
const EMAILJS_SERVICE_ID = "service_swydt8b";
const EMAILJS_TEMPLATE_ID = "template_v7ywqa8";
const EMAILJS_PUBLIC_KEY = "zue0TwvrYFugZfFcX";

const envelope = document.getElementById("envelope");
const openLetterButton = document.getElementById("open-letter");
const yesButton = document.getElementById("yes-btn");
const noButton = document.getElementById("no-btn");
const responseLine = document.getElementById("response-line");
const choiceActions = document.getElementById("choice-actions");
const editorForm = document.getElementById("editor-form");
const copyLinkButton = document.getElementById("copy-link");
const resetFormButton = document.getElementById("reset-form");
const saveTextButton = document.getElementById("save-text");
const copyStatus = document.getElementById("copy-status");

// Disable all form inputs to prevent editing
function disableAllFormInputs() {
  const formInputs = editorForm.querySelectorAll('input, textarea, button');
  formInputs.forEach(input => {
    input.disabled = true;
  });
  editorForm.style.pointerEvents = 'none';
  editorForm.style.opacity = '0.5';
}

const defaults = Object.fromEntries(new FormData(editorForm).entries());
const boundNodes = [...document.querySelectorAll("[data-bind]")];

function applyContent(values) {
  boundNodes.forEach((node) => {
    const key = node.dataset.bind;
    if (!Object.hasOwn(values, key)) {
      return;
    }

    node.textContent = values[key];
  });
}

function readFormValues() {
  return Object.fromEntries(new FormData(editorForm).entries());
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  let hasCustomContent = false;

  Object.keys(defaults).forEach((key) => {
    const value = params.get(key);
    if (!value) {
      return;
    }

    const field = editorForm.elements.namedItem(key);
    if (field) {
      field.value = value;
      hasCustomContent = true;
    }
  });

  if (hasCustomContent) {
    copyStatus.textContent = "Loaded from a custom link.";
  }
}

function updatePreview() {
  applyContent(readFormValues());
}

function saveToLocalStorage() {
  const values = readFormValues();
  localStorage.setItem("apologySiteData", JSON.stringify(values));
  copyStatus.textContent = "✓ Text saved permanently!";
  setTimeout(() => {
    copyStatus.textContent = "Live preview is active.";
  }, 2000);
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("apologySiteData");
  if (saved) {
    const values = JSON.parse(saved);
    Object.entries(values).forEach(([key, value]) => {
      const field = editorForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
    updatePreview();
  }
}

function resetForm() {
  Object.entries(defaults).forEach(([key, value]) => {
    const field = editorForm.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  });

  updatePreview();
  copyStatus.textContent = "Reset to the original text.";
  history.replaceState({}, "", window.location.pathname);
}

async function copyCustomLink() {
  const params = new URLSearchParams();
  const values = readFormValues();

  Object.entries(values).forEach(([key, value]) => {
    if (value && value !== defaults[key]) {
      params.set(key, value);
    }
  });

  if (window.location.protocol === "file:") {
    copyStatus.textContent = "Open this page through localhost before copying a link.";
    return;
  }

  const baseUrl = window.location.href.split("?")[0];
  const url = params.toString()
    ? `${baseUrl}?${params.toString()}`
    : baseUrl;

  try {
    await navigator.clipboard.writeText(url);
    copyStatus.textContent = "Custom link copied. Send that version.";
  } catch {
    copyStatus.textContent = "Could not access clipboard. Copy the URL from the address bar after saving the text.";
  }
}

function openLetter() {
  envelope.classList.add("open");
  document.getElementById("letter").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function moveNoButton() {
  if (window.innerWidth < 640) {
    responseLine.textContent = "I will take the hint, but my apology is still sincere.";
    return;
  }

  const bounds = choiceActions.getBoundingClientRect();
  const maxX = Math.max(0, bounds.width - noButton.offsetWidth - 8);
  const maxY = 48;
  const nextX = Math.random() * maxX;
  const nextY = (Math.random() * maxY) - maxY / 2;

  noButton.style.transform = `translate(${nextX}px, ${nextY}px)`;
  responseLine.textContent = "That button has main-character energy. The apology is still real.";
}

openLetterButton.addEventListener("click", openLetter);
editorForm.addEventListener("input", updatePreview);

// Disable editor form button actions
copyLinkButton.addEventListener("click", (e) => {
  e.preventDefault();
  copyStatus.textContent = "This is a read-only view. You cannot edit or copy links.";
});
resetFormButton.addEventListener("click", (e) => {
  e.preventDefault();
  copyStatus.textContent = "This is a read-only view. You cannot reset the form.";
});
saveTextButton.addEventListener("click", (e) => {
  e.preventDefault();
  copyStatus.textContent = "This is a read-only view. You cannot save changes.";
});

async function sendNotificationEmail() {
  if (EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
    console.warn("EmailJS not configured. Please add your credentials to script.js");
    return;
  }

  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    const recipientName = document.querySelector('[data-bind="recipientName"]').textContent;
    const now = new Date().toLocaleString();

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: "harrypx20@gmail.com",
      recipient_name: recipientName,
      timestamp: now
    });

    console.log("Notification email sent!");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

yesButton.addEventListener("click", async () => {
  openLetter();
  responseLine.textContent = "Thank you. I will make the next scene gentler, steadier, and real.";
  yesButton.textContent = "I mean every word";
  noButton.style.transform = "translate(0, 0)";
  await sendNotificationEmail();
});

noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("click", moveNoButton);

window.addEventListener("load", () => {
  loadFromLocalStorage();
  applyQueryParams();
  updatePreview();
  disableAllFormInputs();

  // Show notification message
  const notificationBanner = document.querySelector('.notification-banner');
  if (notificationBanner) {
    setTimeout(() => {
      notificationBanner.style.opacity = '0.9';
    }, 100);
  }

  setTimeout(() => {
    responseLine.textContent = "If you are still reading, that already means more than you know.";
  }, 1200);
});
