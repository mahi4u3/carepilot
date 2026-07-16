// CarePilot — Client logic & interaction manager
// (Aurora Glass redesign: adds typing indicator, staggered view
// entrances, live pill selection, and XSS-safe user input.)

// ---------- Global state ----------
let activeView = 'home';

// ---------- DOM references ----------
const navItems = document.querySelectorAll('.nav-item');
const miloBtn = document.getElementById('milo-btn');
const screenViews = document.querySelectorAll('.screen-view');
const statusTime = document.getElementById('current-time');
const miloNavImage = document.getElementById('milo-nav-image');
const canvasArea = document.getElementById('canvas-area');

// ---------- Navigation controller ----------
function setView(viewId) {
  if (viewId === activeView) return;
  activeView = viewId;

  // 1. Nav tab active states
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });

  // 2. Milo FAB active state
  miloBtn.classList.toggle('active', viewId === 'milo');

  // 3. Switch visible screen and replay staggered entrance
  screenViews.forEach(screen => {
    const isTarget = screen.id === `${viewId}-screen`;
    screen.classList.toggle('active', isTarget);
    if (isTarget) restartStagger(screen);
  });

  // 4. Scroll canvas to top
  canvasArea.scrollTop = 0;
}

// Re-trigger entrance animations for elements inside a view
function restartStagger(screen) {
  const items = screen.querySelectorAll('.stagger');
  items.forEach(el => {
    el.style.animation = 'none';
    // Force reflow so the animation restarts
    void el.offsetWidth;
    el.style.animation = '';
  });
}

navItems.forEach(item => {
  item.addEventListener('click', () => setView(item.dataset.view));
});

miloBtn.addEventListener('click', () => setView('milo'));

// ---------- Status bar clock ----------
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  if (statusTime) statusTime.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// ---------- Generic toggle groups (visual selection states) ----------
// Day pills on the availability card, calendar strip days, and
// patient filter pills all behave as single-select groups.
function bindToggleGroup(selector, activeClass = 'active') {
  document.querySelectorAll(selector).forEach(group => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn || !group.contains(btn)) return;
      group.querySelectorAll('button').forEach(b => {
        b.classList.toggle(activeClass, b === btn);
        if (b.hasAttribute('aria-pressed')) {
          b.setAttribute('aria-pressed', String(b === btn));
        }
      });
    });
  });
}

bindToggleGroup('.availability-days-row');
bindToggleGroup('.calendar-strip');
bindToggleGroup('.filter-strip');

// ---------- Home screen: legacy suggestion card hooks ----------
const suggestionCard = document.querySelector('.milo-suggestion-card');
const dismissBtn = document.getElementById('milo-dismiss');
const actionBtn = document.getElementById('milo-action-btn');

if (dismissBtn && suggestionCard) {
  dismissBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    suggestionCard.style.transition = 'all 0.3s ease';
    suggestionCard.style.opacity = '0';
    suggestionCard.style.transform = 'scale(0.95)';
    setTimeout(() => { suggestionCard.style.display = 'none'; }, 300);
  });
}

if (actionBtn) {
  actionBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setView('milo');
    simulateMiloInteraction('Draft a message to John Doe for a lab results follow-up.');
  });
}

// ---------- Milo chat ----------
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const miloMainAvatar = document.getElementById('milo-main-avatar');
const miloChatIcon = document.getElementById('milo-chat-icon');
const emotionTags = document.querySelectorAll('.emotion-tag');

const miloAssets = {
  happy: 'assets/milo/milo_happy.png',
  thinking: 'assets/milo/milo_thinking.png',
  thumbsup: 'assets/milo/milo_thumbsup.png',
  caring: 'assets/milo/milo_caring.png',
  alert: 'assets/milo/milo_alert.png',
  reviewing: 'assets/milo/milo_reviewing.png'
};

function changeMiloEmotion(emotion) {
  const assetPath = miloAssets[emotion] || miloAssets.happy;

  if (miloMainAvatar) {
    miloMainAvatar.src = assetPath;
    miloMainAvatar.style.transform = 'scale(1.15)';
    setTimeout(() => { miloMainAvatar.style.transform = 'scale(1)'; }, 220);
  }

  if (miloNavImage) {
    miloNavImage.src = assetPath;
    miloNavImage.style.transform = 'scale(1.15)';
    setTimeout(() => { miloNavImage.style.transform = 'scale(1)'; }, 220);
  }

  if (miloChatIcon) miloChatIcon.src = assetPath;

  emotionTags.forEach(tag => {
    tag.classList.toggle('active', tag.dataset.state === emotion);
  });
}

emotionTags.forEach(tag => {
  tag.addEventListener('click', () => changeMiloEmotion(tag.dataset.state));
});

// Escape user-provided text before injecting into the DOM
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Typing indicator ----------
let typingRow = null;

function showTypingIndicator() {
  if (typingRow) return;
  const activeEmotion = document.querySelector('.emotion-tag.active')?.dataset.state || 'thinking';
  const asset = miloAssets[activeEmotion] || miloAssets.thinking;

  typingRow = document.createElement('div');
  typingRow.className = 'chat-bubble-row milo-bubble';
  typingRow.innerHTML = `
    <img src="${asset}" alt="" class="chat-avatar">
    <div class="chat-bubble-content">
      <span class="typing-indicator" aria-label="Milo is typing"><i></i><i></i><i></i></span>
    </div>
  `;
  chatMessages.appendChild(typingRow);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  if (typingRow) {
    typingRow.remove();
    typingRow = null;
  }
}

// ---------- Chat message rendering ----------
function appendChatMessage(sender, text, { html = false } = {}) {
  const row = document.createElement('div');
  row.className = `chat-bubble-row ${sender === 'user' ? 'user-bubble' : 'milo-bubble'}`;

  const safeText = html ? text : escapeHTML(text);
  const timeStr = 'Just now';

  if (sender === 'milo') {
    const activeEmotion = document.querySelector('.emotion-tag.active')?.dataset.state || 'happy';
    const currentAsset = miloAssets[activeEmotion];
    row.innerHTML = `
      <img src="${currentAsset}" alt="Milo" class="chat-avatar">
      <div class="chat-bubble-content">
        <p>${safeText}</p>
        <span class="chat-time">${timeStr}</span>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="chat-bubble-content">
        <p>${safeText}</p>
        <span class="chat-time">${timeStr}</span>
      </div>
    `;
  }

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ---------- Simulated Milo responses ----------
function getMiloResponse(userMsg) {
  const msg = userMsg.toLowerCase();
  if (msg.includes('john') || msg.includes('doe') || msg.includes('summarize')) {
    return "<strong>John Doe (45, Cardio Consultation):</strong> Bloodwork shows elevated serum calcium levels (11.2 mg/dL). EKG shows normal sinus rhythm. Medical history indicates mild hypertension. I suggest checking for primary hyperparathyroidism.";
  } else if (msg.includes('draft') || msg.includes('message')) {
    return "Here is a message draft for John Doe:<br><br><em>'Hi John, Dr. Patel's office here. We received your recent dental lab reports. Dr. Patel would like to schedule a quick 15-minute follow-up this Friday to review the results together. Please click here to select a time: carepilot.link/jd-sched'</em>";
  } else if (msg.includes('schedule') || msg.includes('calendar') || msg.includes('upcoming')) {
    return "You have <strong>3 appointments</strong> left today:<br>• 10:30 AM: Sarah Smith (Routine check)<br>• 01:30 PM: Robert Johnson (Meds review)<br>• 03:00 PM: Emily Davis (Therapy check)";
  }
  return "I am on it! Let me fetch that information from the clinic records for you. Is there anything else you'd like to check in the meantime?";
}

// Shared reply lifecycle: thinking → typing dots → reply
function miloReply(sourceText, nextEmotion, delay = 1100) {
  changeMiloEmotion('thinking');
  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    changeMiloEmotion(nextEmotion);
    appendChatMessage('milo', getMiloResponse(sourceText), { html: true });
  }, delay);
}

// ---------- Send actions ----------
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  appendChatMessage('user', text);

  const nextEmotion = text.toLowerCase().includes('draft') ? 'thumbsup' : 'happy';
  miloReply(text, nextEmotion);
}

function simulateMiloInteraction(userPrompt) {
  setTimeout(() => {
    appendChatMessage('user', userPrompt);
    miloReply('draft', 'thumbsup', 1200);
  }, 300);
}

if (chatSend && chatInput) {
  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// ---------- Quick reply chips ----------
const quickReplies = [
  { id: 'chip-sum', prompt: "Summarize John Doe's profile", keyword: 'summarize', emotion: 'reviewing' },
  { id: 'chip-draft', prompt: 'Draft a follow-up message to John', keyword: 'draft', emotion: 'thumbsup' },
  { id: 'chip-schedule', prompt: 'What does my schedule look like?', keyword: 'schedule', emotion: 'happy' }
];

quickReplies.forEach(({ id, prompt, keyword, emotion }) => {
  const chip = document.getElementById(id);
  if (!chip) return;
  chip.addEventListener('click', () => {
    appendChatMessage('user', prompt);
    miloReply(keyword, emotion, 1000);
  });
});

// ---------- Speech bubble "Open Milo chat" link ----------
const openMiloChatLink = document.getElementById('open-milo-chat-link');
if (openMiloChatLink) {
  openMiloChatLink.addEventListener('click', (e) => {
    e.stopPropagation();
    setView('milo');
  });
}
