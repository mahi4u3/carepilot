// CarePilot Client Logic & Interaction Manager

// Global State
let activeView = 'home';

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const miloBtn = document.getElementById('milo-btn');
const screenViews = document.querySelectorAll('.screen-view');
const miloNavImage = document.getElementById('milo-nav-image');

// --- Navigation State Controller ---
function setView(viewId) {
  activeView = viewId;

  // 1. Update Navigation Tabs Active States
  navItems.forEach(item => {
    if (item.dataset.view === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 2. Update Milo Overlapping Button Active State
  if (viewId === 'milo') {
    miloBtn.classList.add('active');
  } else {
    miloBtn.classList.remove('active');
  }

  // 3. Toggle Visible Screen View with Fade Transition
  screenViews.forEach(screen => {
    if (screen.id === `${viewId}-screen`) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });

  // 4. Scroll canvas back to top on view changes
  const canvasArea = document.getElementById('canvas-area');
  canvasArea.scrollTop = 0;
}

// Bind Navigation Click Listeners
navItems.forEach(item => {
  item.addEventListener('click', () => {
    setView(item.dataset.view);
  });
});

miloBtn.addEventListener('click', () => {
  setView('milo');
});



// --- Home Screen Interactions & Quick Actions ---
const quickActionCards = document.querySelectorAll('.quick-action-card');
const attentionItems = document.querySelectorAll('.attention-item');

quickActionCards.forEach(card => {
  card.addEventListener('click', () => {
    const label = card.querySelector('.qa-label')?.innerText.replace('\n', ' ');
    if (label.includes('Search')) {
      setView('patients');
      const searchInput = document.querySelector('.search-input');
      if (searchInput) searchInput.focus();
    } else if (label.includes('Check In') || label.includes('Walk-in')) {
      setView('patients');
    } else if (label.includes('Appointment')) {
      setView('calendar');
    } else if (label.includes('Call')) {
      setView('milo');
      simulateMiloInteraction("Initiate phone call to patient Mrs. Sharma.");
    }
  });
});

attentionItems.forEach(item => {
  item.addEventListener('click', () => {
    const title = item.querySelector('.att-title')?.innerText || '';
    if (title.includes('Confirm') || title.includes('slot')) {
      setView('calendar');
    } else if (title.includes('Check in') || title.includes('call')) {
      setView('patients');
    }
  });
});

// --- Milo Assistant Chat View Logic ---
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const miloMainAvatar = document.getElementById('milo-main-avatar');
const miloChatIcon = document.getElementById('milo-chat-icon');
const emotionTags = document.querySelectorAll('.emotion-tag');

// Available Mascot Images mapped to emotions
const miloAssets = {
  happy: 'assets/milo/milo_happy.png',
  thinking: 'assets/milo/milo_thinking.png',
  thumbsup: 'assets/milo/milo_thumbsup.png',
  caring: 'assets/milo/milo_caring.png',
  alert: 'assets/milo/milo_alert.png',
  reviewing: 'assets/milo/milo_reviewing.png'
};

// Update Milo's emotion in avatar slots
function changeMiloEmotion(emotion) {
  const assetPath = miloAssets[emotion] || miloAssets.happy;
  
  // Update avatars with scale pop effect
  if (miloMainAvatar) {
    miloMainAvatar.src = assetPath;
    miloMainAvatar.style.transform = 'scale(1.15)';
    setTimeout(() => miloMainAvatar.style.transform = 'scale(1)', 200);
  }
  
  if (miloNavImage) {
    miloNavImage.src = assetPath;
    miloNavImage.style.transform = 'scale(1.15)';
    setTimeout(() => miloNavImage.style.transform = 'scale(1)', 200);
  }

  if (miloChatIcon) {
    miloChatIcon.src = assetPath;
  }

  // Update active pill styling in emotion strip
  emotionTags.forEach(tag => {
    if (tag.dataset.state === emotion) {
      tag.classList.add('active');
    } else {
      tag.classList.remove('active');
    }
  });
}

// Bind Emotion Tags clicks
emotionTags.forEach(tag => {
  tag.addEventListener('click', () => {
    changeMiloEmotion(tag.dataset.state);
  });
});

// Add message to chat history UI
function appendChatMessage(sender, text) {
  const row = document.createElement('div');
  row.className = `chat-bubble-row ${sender === 'user' ? 'user-bubble' : 'milo-bubble'}`;
  
  const timeStr = 'Just now';
  
  if (sender === 'milo') {
    const activeEmotion = document.querySelector('.emotion-tag.active')?.dataset.state || 'happy';
    const currentAsset = miloAssets[activeEmotion];
    row.innerHTML = `
      <img src="${currentAsset}" alt="Milo" class="chat-avatar">
      <div class="chat-bubble-content">
        <p>${text}</p>
        <span class="chat-time">${timeStr}</span>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="chat-bubble-content">
        <p>${text}</p>
        <span class="chat-time">${timeStr}</span>
      </div>
    `;
  }
  
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulated Milo responses based on keyword queries
function getMiloResponse(userMsg) {
  const msg = userMsg.toLowerCase();
  if (msg.includes('john') || msg.includes('doe') || msg.includes('summarize')) {
    return "<strong>John Doe (45, Cardio Consultation):</strong> Bloodwork shows elevated serum calcium levels (<span class=\"tabular-nums\">11.2</span> mg/dL). EKG shows normal sinus rhythm. Medical history indicates mild hypertension. I suggest checking for primary hyperparathyroidism.";
  } else if (msg.includes('draft') || msg.includes('message')) {
    return "Here is a message draft for John Doe:<br><br><em>'Hi John, Dr. Patel's office here. We received your recent lab reports. Dr. Patel would like to schedule a quick <span class=\"tabular-nums\">15</span>-minute follow-up this Friday to review the results together. Please click here to select a time: carepilot.link/jd-sched'</em>";
  } else if (msg.includes('schedule') || msg.includes('calendar') || msg.includes('upcoming')) {
    return "You have <strong class=\"tabular-nums\">3 appointments</strong> left today:<br>• <span class=\"tabular-nums\">10:30 AM</span>: Sarah Smith (Routine check)<br>• <span class=\"tabular-nums\">01:30 PM</span>: Robert Johnson (Meds review)<br>• <span class=\"tabular-nums\">03:00 PM</span>: Emily Davis (Therapy check)";
  } else {
    return "I am on it! Let me fetch that information from the clinic records for you. Is there anything else you'd like to check in the meantime?";
  }
}

// Core send action
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  
  chatInput.value = '';
  appendChatMessage('user', text);
  
  // Trigger Milo response lifecycle (thinking state -> reply)
  changeMiloEmotion('thinking');
  
  // Create simulated typing delay
  setTimeout(() => {
    const replyText = getMiloResponse(text);
    // Switch to thumbsup or happy on success response
    const nextEmotion = text.toLowerCase().includes('draft') ? 'thumbsup' : 'happy';
    changeMiloEmotion(nextEmotion);
    appendChatMessage('milo', replyText);
  }, 1000);
}

// Trigger conversation programmatically (for suggestion card click)
function simulateMiloInteraction(userPrompt) {
  setTimeout(() => {
    appendChatMessage('user', userPrompt);
    changeMiloEmotion('thinking');
    
    setTimeout(() => {
      changeMiloEmotion('thumbsup');
      const draftResponse = getMiloResponse('draft');
      appendChatMessage('milo', draftResponse);
    }, 1200);
  }, 300);
}

// Click and Enter event listeners for chat input
if (chatSend && chatInput) {
  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Quick Reply Chips interaction
const chipSum = document.getElementById('chip-sum');
const chipDraft = document.getElementById('chip-draft');
const chipSchedule = document.getElementById('chip-schedule');

if (chipSum) {
  chipSum.addEventListener('click', () => {
    appendChatMessage('user', "Summarize John Doe's profile");
    changeMiloEmotion('thinking');
    setTimeout(() => {
      changeMiloEmotion('reviewing');
      appendChatMessage('milo', getMiloResponse('summarize'));
    }, 1000);
  });
}

if (chipDraft) {
  chipDraft.addEventListener('click', () => {
    appendChatMessage('user', "Draft a follow-up message to John");
    changeMiloEmotion('thinking');
    setTimeout(() => {
      changeMiloEmotion('thumbsup');
      appendChatMessage('milo', getMiloResponse('draft'));
    }, 1000);
  });
}

if (chipSchedule) {
  chipSchedule.addEventListener('click', () => {
    appendChatMessage('user', "What does my schedule look like?");
    changeMiloEmotion('thinking');
    setTimeout(() => {
      changeMiloEmotion('happy');
      appendChatMessage('milo', getMiloResponse('schedule'));
    }, 1000);
  });
}

// Bind Open Milo Chat Link inside the speech bubble
const openMiloChatLink = document.getElementById('open-milo-chat-link');
if (openMiloChatLink) {
  openMiloChatLink.addEventListener('click', (e) => {
    e.stopPropagation();
    setView('milo');
  });
}

// --- Startup Loading Screen Controller ---
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    // Keep visible for 2000ms, then trigger fade-out
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      
      // Turn off display after 500ms animation finishes
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 2000);
  }
});
