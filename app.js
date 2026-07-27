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
  const bottomNav = document.querySelector('.bottom-nav');
  const canvasArea = document.getElementById('canvas-area');

  // Hide Bottom Nav for Milo screen; restore for other views
  if (viewId === 'milo') {
    if (bottomNav) bottomNav.style.display = 'none';
    if (canvasArea) canvasArea.classList.add('milo-mode');
    if (miloBtn) miloBtn.classList.add('active');
    setTimeout(updateSuggestedActionsStrip, 100);
  } else {
    if (bottomNav) bottomNav.style.display = 'flex';
    if (canvasArea) canvasArea.classList.remove('milo-mode');
    if (miloBtn) miloBtn.classList.remove('active');
  }

  // 1. Update Navigation Tabs Active States
  navItems.forEach(item => {
    if (item.dataset.view === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 2. Toggle Visible Screen View
  screenViews.forEach(screen => {
    if (screen.id === `${viewId}-screen`) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });

  // 3. Scroll canvas back to top on view changes
  if (canvasArea) canvasArea.scrollTop = 0;
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
  welcoming: 'assets/milo/Milo_overview.png',
  attentive: 'assets/milo/milo_caring.png',
  happy: 'assets/milo/milo_happy.png',
  alert: 'assets/milo/milo_alert.png',
  thinking: 'assets/milo/milo_thinking.png',
  celebrating: 'assets/milo/milo_thumbsup.png',
  focused: 'assets/milo/milo_reviewing.png',
  thumbsup: 'assets/milo/milo_thumbsup.png',
  caring: 'assets/milo/milo_caring.png',
  reviewing: 'assets/milo/milo_reviewing.png'
};

// Update Milo's emotion in avatar slots
function changeMiloEmotion(emotion) {
  const assetPath = miloAssets[emotion] || miloAssets.welcoming || miloAssets.happy;
  
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

  // Always refresh suggested action pills for Milo messages
  if (sender === 'milo') {
    setTimeout(() => updateTurnByTurnSuggestions(text), 150);
  }
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

// Core send action with Intent Router & Free-Form Resilience
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  
  chatInput.value = '';
  const lowerText = text.toLowerCase();

  // 1. Patient List Intent Handler
  if (lowerText.includes('patient list') || lowerText.includes('today\'s patients') || lowerText.includes('patients scheduled') || lowerText === 'patients' || lowerText.includes('show patients')) {
    executeScenarioPill('SHOW_PATIENT_LIST', text);
    return;
  }

  // 2. Workflow Intent Router for Free-Form Inputs
  if (lowerText.includes('first appointment') || lowerText.includes('who is first') || lowerText.includes('next patient')) {
    executeScenarioPill('GOTO_STATE_2', text);
    return;
  } else if (lowerText.includes('arrived') || lowerText.includes('check in') || lowerText.includes('lobby')) {
    executeScenarioPill('TRIGGER_ARRIVAL_CHECK', text);
    return;
  } else if (lowerText.includes('delay') || lowerText.includes('late') || lowerText.includes('overrun')) {
    executeScenarioPill('GOTO_STATE_4', text);
    return;
  } else if (lowerText.includes('notes') || lowerText.includes('completed') || lowerText.includes('done')) {
    executeScenarioPill('GOTO_STATE_5', text);
    return;
  }

  // 3. Fallback General AI Practice Coordinator Query Handler
  appendChatMessage('user', text);
  changeMiloEmotion('focused');
  
  setTimeout(() => {
    const replyText = getMiloResponse(text);
    changeMiloEmotion('focused');
    appendChatMessage('milo', replyText);
  }, 600);
}

// --- End-to-End Scenario State Machine ---
const scenarioState = {
  activeState: 'STATE_1_ONBOARDING', // STATE_1_ONBOARDING, STATE_2_READINESS, STATE_3_ARRIVED, STATE_3_LATE, STATE_4_OVERRUN, STATE_5_POST_CONSULT, STATE_PATIENT_LIST
  activePatient: {
    name: 'Ritika Sharma',
    time: '9:30 AM',
    reason: 'Consultation & Dental Review',
    room: 'Room 2'
  },
  nextPatient: {
    name: 'Sarah Smith',
    time: '10:30 AM',
    reason: 'Routine Follow-up & Cleaning',
    room: 'Room 1'
  }
};

// Render Turn-by-Turn Suggested Action Pills aligned strictly to current State Machine
function updateTurnByTurnSuggestions() {
  const container = document.querySelector('.suggested-actions-strip');
  if (!container) return;

  let suggestions = [];

  switch (scenarioState.activeState) {
    case 'STATE_1_ONBOARDING':
      suggestions = [
        { label: 'Who is my first appointment today?', action: 'GOTO_STATE_2' },
        { label: 'Show pending confirmations', action: 'SHOW_CONFIRMATIONS' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;

    case 'STATE_2_READINESS':
      const activeP = scenarioState.activePatient.name;
      suggestions = [
        { label: `Has ${activeP} arrived in lobby?`, action: 'TRIGGER_ARRIVAL_CHECK' },
        { label: 'Mark as Checked In', action: 'CHOOSE_BRANCH_A' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;

    case 'STATE_3_ARRIVED': // Branch A
      suggestions = [
        { label: 'Inform patient doctor will reach soon', action: 'INFORM_REACH_SOON' },
        { label: 'Start consultation now', action: 'GOTO_STATE_4' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;

    case 'STATE_3_LATE': // Branch B
      suggestions = [
        { label: 'Send SMS reminder to patient', action: 'SEND_SMS_REMINDER' },
        { label: 'Call patient', action: 'PROMPT_CALL_PATIENT' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;

    case 'STATE_POST_CONTACT':
      suggestions = [
        { label: 'Check if patient arrived in lobby', action: 'TRIGGER_ARRIVAL_CHECK' },
        { label: 'Swap slot with next waiting patient', action: 'SWAP_SLOTS_WITH_NEXT' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;

    case 'STATE_4_OVERRUN':
      suggestions = [
        { label: 'Notify waiting patients of 15-min delay', action: 'NOTIFY_15M_DELAY' },
        { label: 'Complete consultation & proceed', action: 'GOTO_STATE_5' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;

    case 'STATE_5_POST_CONSULT':
      suggestions = [
        { label: 'Add clinical notes', action: 'OPEN_CLINICAL_NOTES' },
        { label: 'Schedule follow-up', action: 'OPEN_FOLLOWUP_PICKER' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;

    case 'STATE_PATIENT_LIST':
      suggestions = [
        { label: 'Who is currently waiting in the lobby?', action: 'TRIGGER_ARRIVAL_CHECK' },
        { label: 'Show next scheduled appointment', action: 'GOTO_STATE_2' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;

    default:
      suggestions = [
        { label: 'Who is my first appointment today?', action: 'GOTO_STATE_2' },
        { label: 'View today\'s full schedule', action: 'SHOW_SCHEDULE' },
        { label: 'Add Walk-in Patient', action: 'ADD_WALKIN' }
      ];
      break;
  }

  let pillsHTML = '';
  suggestions.forEach((sug, idx) => {
    const colorClass = idx === 0 ? 'primary-green' : '';
    pillsHTML += `
      <button class="smart-sug-pill ${colorClass}" onclick="executeScenarioPill('${sug.action}', '${sug.label.replace(/'/g, "\\'")}')">
        ${sug.label}
      </button>
    `;
  });

  // Always append [+ More] chip at the end
  pillsHTML += `
    <button class="smart-sug-pill" style="background:#F1F5F9; color:#0F172A; font-weight:700;" onclick="executeScenarioPill('SHOW_MORE_OPTIONS', '+ More')">
      + More
    </button>
  `;

  container.innerHTML = pillsHTML;
}

function updateSuggestedActionsStrip() {
  updateTurnByTurnSuggestions();
}

function updateScenarioSuggestedActions() {
  updateTurnByTurnSuggestions();
}

function executeSuggestedTurnPill(actionKey, labelText) {
  executeScenarioPill(actionKey, labelText);
}

// Master Scenario Action Handler & State Router
function executeScenarioPill(actionKey, labelText) {
  appendChatMessage('user', labelText);
  const pName = scenarioState.activePatient.name;
  const nextName = scenarioState.nextPatient.name;

  switch (actionKey) {

    // Patient List Query Action Handler - Overhauled Flexbox Queue Card
    case 'SHOW_PATIENT_LIST':
      scenarioState.activeState = 'STATE_PATIENT_LIST';
      changeMiloEmotion('focused');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/milo_reviewing.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <p>Here is today's real-time patient queue (18 Scheduled):</p>
            <div class="patient-queue-card">
              <div class="queue-header">
                <h4>Today's Patient Queue</h4>
                <span class="badge-blue">Real-time Sync</span>
              </div>
              <div class="patient-row">
                <div class="patient-info">
                  <span class="patient-name-title">${scenarioState.activePatient.name}</span>
                  <span class="patient-meta-sub">9:30 AM &bull; Consultation</span>
                </div>
                <span class="status-pill state-badge-checked">Waiting in Lobby</span>
              </div>
              <div class="patient-row">
                <div class="patient-info">
                  <span class="patient-name-title">${scenarioState.nextPatient.name}</span>
                  <span class="patient-meta-sub">10:30 AM &bull; Follow-up</span>
                </div>
                <span class="status-pill state-badge-lobby">Upcoming (10:30 AM)</span>
              </div>
              <div class="patient-row">
                <div class="patient-info">
                  <span class="patient-name-title">Robert Johnson</span>
                  <span class="patient-meta-sub">11:30 AM &bull; Meds Review</span>
                </div>
                <span class="status-pill state-badge-lobby">Upcoming (11:30 AM)</span>
              </div>
              <div class="patient-row">
                <div class="patient-info">
                  <span class="patient-name-title">John Doe</span>
                  <span class="patient-meta-sub">8:30 AM &bull; Routine Check</span>
                </div>
                <span class="status-pill state-badge-done">Consulted</span>
              </div>
            </div>
            <span class="chat-time">Just now</span>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    // Transition to State 2: Pre-Appointment Readiness (T-15 mins)
    case 'GOTO_STATE_2':
      scenarioState.activeState = 'STATE_2_READINESS';
      changeMiloEmotion('attentive');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/milo_caring.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <p>Here is your first upcoming appointment preview (in 15 mins):</p>
            <div class="first-appt-card" style="margin-top:10px;">
              <div class="first-appt-left">
                <div class="clock-icon-box">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <span class="first-appt-meta-lbl">First appointment</span>
                  <h4 class="first-appt-name">${pName}</h4>
                  <p class="first-appt-sub">Today at <span class="tabular-nums">9:30 AM</span> &bull; ${scenarioState.activePatient.reason}</p>
                </div>
              </div>
              <div class="first-appt-right">
                <span class="time-pill-green tabular-nums">In 15 mins</span>
              </div>
            </div>
            <span class="chat-time">Just now</span>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    // Trigger Arrival Check Prompt (Choice between Branch A: Arrived vs Branch B: Not Arrived)
    case 'TRIGGER_ARRIVAL_CHECK':
      changeMiloEmotion('attentive');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/milo_caring.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <p><strong>Lobby Arrival Check for ${pName}:</strong></p>
            <p style="font-size:12.5px; color:#475569; margin-top:4px;">Please select the current lobby status for ${pName}:</p>
            <div class="inline-btn-group" style="margin-top:10px;">
              <button class="smart-sug-pill primary-green" onclick="executeScenarioPill('CHOOSE_BRANCH_A', 'Patient HAS Arrived in Lobby')">✓ Patient HAS Arrived (Checked In)</button>
              <button class="smart-sug-pill primary-orange" onclick="executeScenarioPill('CHOOSE_BRANCH_B', 'Patient HAS NOT Arrived (Late)')">⚠️ Patient HAS NOT Arrived (Late)</button>
            </div>
            <span class="chat-time">Just now</span>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      break;

    // Branch A: Patient HAS Arrived
    case 'CHOOSE_BRANCH_A':
      scenarioState.activeState = 'STATE_3_ARRIVED';
      changeMiloEmotion('happy');
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-checked">✓ Patient Arrived</span><br>
          <strong>${pName}</strong> is checked in and waiting in Lobby A for Room 2.
        `);
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    // Branch B: Patient HAS NOT Arrived (T-10 mins / Late)
    case 'CHOOSE_BRANCH_B':
      scenarioState.activeState = 'STATE_3_LATE';
      changeMiloEmotion('alert');
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-next">⚠️ Arrival Alert</span><br>
          <strong>${pName}</strong> has NOT checked in yet for the 9:30 AM slot (10 mins past expected check-in).
        `);
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    // Branch A Actions
    case 'INFORM_REACH_SOON':
      changeMiloEmotion('happy');
      setTimeout(() => {
        appendChatMessage('milo', `Lobby announcement dispatches: <em>"Dr. Patel will be with you shortly, ${pName}."</em>`);
      }, 500);
      break;

    case 'WAIT_LOBBY_A':
      changeMiloEmotion('happy');
      setTimeout(() => {
        appendChatMessage('milo', `Patient app update dispatches: <em>"${pName}, please relax in Lobby A. You are next in queue."</em>`);
      }, 500);
      break;

    // Branch B Actions & Slot Swap
    case 'SEND_SMS_REMINDER':
      scenarioState.activeState = 'STATE_POST_CONTACT';
      changeMiloEmotion('alert');
      setTimeout(() => {
        appendChatMessage('milo', `Automated SMS sent to <strong>${pName}</strong>: <em>"Hi ${pName}, your 9:30 AM appointment with Dr. Patel is starting soon. Please reply to confirm your arrival time."</em>`);
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    case 'PROMPT_CALL_PATIENT':
      scenarioState.activeState = 'STATE_POST_CONTACT';
      changeMiloEmotion('alert');
      setTimeout(() => {
        appendChatMessage('milo', `Initiating phone dialer link for <strong>${pName}</strong> (<span class="tabular-nums">+1 555-0198</span>)...`);
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    case 'CHECK_INCOMING_MSG':
      changeMiloEmotion('focused');
      setTimeout(() => {
        appendChatMessage('milo', `No new SMS reply received from <strong>${scenarioState.activePatient.name}</strong> yet (SMS sent 2 mins ago).`);
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    case 'SWAP_SLOTS_WITH_NEXT':
      scenarioState.activeState = 'STATE_3_ARRIVED';
      // Swap active patient to Sarah Smith
      const oldActive = { ...scenarioState.activePatient };
      scenarioState.activePatient = { ...scenarioState.nextPatient, time: '9:30 AM' };
      scenarioState.nextPatient = { ...oldActive, time: '10:30 AM' };
      changeMiloEmotion('happy');

      // Generate real-time timestamp (e.g., 10:42 AM)
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'system-alert-row';
        row.innerHTML = `
          <div class="system-alert-card">
            <div class="system-alert-header">
              <div class="system-alert-badge">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span>Automated System Alert &bull; Today at ${nowTime}</span>
              </div>
            </div>
            <h4 class="system-alert-title">Appointment Time Swap Confirmed</h4>
            <p class="system-alert-sub">Messages with appointment change details have been automatically sent to both patients for awareness.</p>
            <div class="system-swap-details-box">
              <div class="swap-detail-item">
                <span class="detail-label">New Appointment Slot:</span>
                <strong class="detail-value">${scenarioState.activePatient.name} &ndash; Today at 9:30 AM (Waiting in Lobby A)</strong>
              </div>
              <div class="swap-detail-item">
                <span class="detail-label">Rescheduled Patient:</span>
                <strong class="detail-value">${scenarioState.nextPatient.name} &ndash; Rescheduled to 10:30 AM</strong>
              </div>
              <div class="swap-detail-item">
                <span class="detail-label">Provider:</span>
                <strong class="detail-value">Dr. Patel (General Practice / Cardiology)</strong>
              </div>
              <div class="swap-detail-item">
                <span class="detail-label">Status:</span>
                <span class="state-indicator-badge state-badge-checked" style="width:fit-content; margin-top:2px;">Updated &amp; Synced with Calendar</span>
              </div>
            </div>
            <p class="system-alert-footer">Need to make further changes? Reply to Milo at any time.</p>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    // Transition to State 4: Schedule Overrun / Delay Management
    case 'GOTO_STATE_4':
    case 'START_CONSULTATION':
      scenarioState.activeState = 'STATE_4_OVERRUN';
      changeMiloEmotion('thinking');
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-session">● Consultation In Progress</span><br>
          Active session with <strong>${scenarioState.activePatient.name}</strong> started in Room 2.<br><br>
          <em style="font-size:12px; color:#EA580C;">Schedule Monitor: Consultation running 10+ minutes over. Next patient (${scenarioState.nextPatient.name}) is waiting in lobby.</em>
        `);
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    case 'NOTIFY_15M_DELAY':
      changeMiloEmotion('thinking');
      setTimeout(() => {
        appendChatMessage('milo', `Broadcast sent to <strong>${scenarioState.nextPatient.name}</strong> and waiting queue: <em>"Dr. Patel is running approximately 15 minutes behind schedule. We apologize for the delay."</em>`);
      }, 500);
      break;

    case 'OFFER_RESCHEDULE_WAITLIST':
      changeMiloEmotion('thinking');
      setTimeout(() => {
        appendChatMessage('milo', `SMS options sent to waiting list offering automated 1-click rescheduling to tomorrow morning.`);
      }, 500);
      break;

    // Transition to State 5: Post-Consultation & Queue Transition
    case 'GOTO_STATE_5':
      scenarioState.activeState = 'STATE_5_POST_CONSULT';
      changeMiloEmotion('celebrating');
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-done">🎉 Consultation Completed</span><br>
          Session completed for <strong>${scenarioState.activePatient.name}</strong>. Summary card generated.
        `);
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    case 'OPEN_CLINICAL_NOTES':
      changeMiloEmotion('celebrating');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/milo_thumbsup.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <p><strong>Clinical Notes &ndash; ${scenarioState.activePatient.name}</strong></p>
            <div class="note-editor-box">
              <textarea class="note-textarea" id="note-text-input" placeholder="Type clinical observations or select quick tags..."></textarea>
              <div class="quick-tags-strip">
                <span class="quick-tag-chip" onclick="appendTagToNote('Routine Consultation')">Routine Consultation</span>
                <span class="quick-tag-chip" onclick="appendTagToNote('Vitals Stable')">Vitals Stable</span>
                <span class="quick-tag-chip" onclick="appendTagToNote('Prescription Issued')">Prescription Issued</span>
                <span class="quick-tag-chip" onclick="appendTagToNote('Follow-up in 2 weeks')">Follow-up 2 wks</span>
              </div>
              <div style="display:flex; justify-content:flex-end;">
                <button class="smart-sug-pill primary-green" onclick="saveClinicalNote('${scenarioState.activePatient.name}')">Save Notes</button>
              </div>
            </div>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      break;

    case 'OPEN_FOLLOWUP_PICKER':
      changeMiloEmotion('celebrating');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/milo_thumbsup.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <div class="inline-picker-card">
              <div class="inline-picker-header">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16A34A" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                <span>Schedule Follow-up for ${scenarioState.activePatient.name}</span>
              </div>
              <div class="picker-row">
                <label style="font-size:11px; font-weight:600; color:#475569;">Select Date:</label>
                <input type="date" value="2026-08-10" class="inline-date-input" id="resched-date">
                <label style="font-size:11px; font-weight:600; color:#475569; margin-top:6px;">Available Time Slots:</label>
                <div class="time-slots-grid">
                  <div class="time-slot-pill selected" onclick="selectTimeSlot(this)">9:30 AM</div>
                  <div class="time-slot-pill" onclick="selectTimeSlot(this)">11:00 AM</div>
                  <div class="time-slot-pill" onclick="selectTimeSlot(this)">2:30 PM</div>
                  <div class="time-slot-pill" onclick="selectTimeSlot(this)">4:00 PM</div>
                </div>
              </div>
              <div style="display:flex; justify-content:flex-end;">
                <button class="smart-sug-pill primary-green" onclick="confirmReschedule('${scenarioState.activePatient.name}')">Book Follow-up</button>
              </div>
            </div>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      break;

    case 'CALL_NEXT_PATIENT':
      scenarioState.activeState = 'STATE_2_READINESS';
      // Shift next patient to active
      scenarioState.activePatient = { ...scenarioState.nextPatient };
      scenarioState.nextPatient = { name: 'Robert Johnson', time: '11:30 AM', reason: 'Meds Review', room: 'Room 3' };
      changeMiloEmotion('attentive');
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-next">➡️ Next Patient Queued</span><br>
          Transitioning to next appointment: <strong>${scenarioState.activePatient.name}</strong> (${scenarioState.activePatient.time} &bull; ${scenarioState.activePatient.reason}).
        `);
        updateTurnByTurnSuggestions();
      }, 500);
      break;

    // Helper Actions
    case 'SHOW_CONFIRMATIONS':
      changeMiloEmotion('welcoming');
      setTimeout(() => {
        appendChatMessage('milo', `You have <strong>2 pending confirmations</strong>:<br>1. <strong>Ritika Sharma</strong> (9:30 AM)<br>2. <strong>Sarah Smith</strong> (10:30 AM)`);
      }, 500);
      break;

    case 'SHOW_SCHEDULE':
      changeMiloEmotion('welcoming');
      setTimeout(() => {
        appendChatMessage('milo', `<strong>Today's Schedule Summary:</strong><br>&bull; 9:30 AM: Ritika Sharma (Consultation)<br>&bull; 10:30 AM: Sarah Smith (Follow-up)<br>&bull; 11:30 AM: Robert Johnson (Meds Review)`);
      }, 500);
      break;

    case 'REVIEW_COMPLAINT':
      changeMiloEmotion('attentive');
      setTimeout(() => {
        appendChatMessage('milo', `<strong>Chief Complaint &ndash; ${pName}:</strong><br>&bull; Primary symptom: Tooth sensitivity & mild molar pain for 3 days.<br>&bull; Medical history: Clean, no allergies.`);
      }, 500);
      break;

    case 'NOTIFY_READY':
      changeMiloEmotion('attentive');
      setTimeout(() => {
        appendChatMessage('milo', `Notification dispatches to <strong>${pName}</strong>: <em>"Dr. Patel is ready for you in Room 2."</em>`);
      }, 500);
      break;

    // Walk-in Patient Workflow Handler
    case 'ADD_WALKIN':
      changeMiloEmotion('welcoming');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/Milo_overview.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <p><strong>Walk-in Patient Registration:</strong></p>
            <p style="font-size:12.5px; color:#475569; margin-top:4px;">Is this a <strong>New Patient</strong> or an <strong>Existing Patient</strong>?</p>
            <div class="inline-btn-group" style="margin-top:10px;">
              <button class="smart-sug-pill primary-green" onclick="executeScenarioPill('WALKIN_NEW_PATIENT', 'New Patient')">➕ New Patient</button>
              <button class="smart-sug-pill" onclick="executeScenarioPill('WALKIN_EXISTING_PATIENT', 'Existing Patient')">🔍 Existing Patient</button>
            </div>
            <span class="chat-time">Just now</span>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      break;

    case 'WALKIN_NEW_PATIENT':
      changeMiloEmotion('focused');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/milo_reviewing.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <div class="walkin-form-card">
              <h4 style="margin:0 0 10px 0; font-family:'Outfit',sans-serif; font-size:14px; color:#0F172A;">➕ Register New Walk-in Patient</h4>
              <div class="form-group" style="margin-bottom:8px;">
                <label style="font-size:11px; font-weight:600; color:#64748B; text-transform:uppercase;">Patient Name *</label>
                <input type="text" id="walkin-name" class="walkin-input" placeholder="e.g. Ananya Roy" value="Ananya Roy">
              </div>
              <div class="form-row" style="display:flex; gap:8px; margin-bottom:8px;">
                <div style="flex:1;">
                  <label style="font-size:11px; font-weight:600; color:#64748B; text-transform:uppercase;">Age *</label>
                  <input type="text" id="walkin-age" class="walkin-input" placeholder="e.g. 34 Yrs" value="34 Yrs">
                </div>
                <div style="flex:1;">
                  <label style="font-size:11px; font-weight:600; color:#64748B; text-transform:uppercase;">Location *</label>
                  <input type="text" id="walkin-loc" class="walkin-input" placeholder="e.g. Sector 5, City" value="Sector 5, City">
                </div>
              </div>
              <div class="form-group" style="margin-bottom:12px;">
                <label style="font-size:11px; font-weight:600; color:#64748B; text-transform:uppercase;">Notes / Chief Complaints</label>
                <input type="text" id="walkin-notes" class="walkin-input" placeholder="e.g. Sudden severe headache & mild fever" value="Sudden severe headache & mild fever">
              </div>
              <button class="walkin-submit-btn" onclick="submitNewWalkinPatient()">Register &amp; Add to Queue</button>
            </div>
            <span class="chat-time">Just now</span>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      break;

    case 'WALKIN_EXISTING_PATIENT':
      changeMiloEmotion('focused');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/milo_reviewing.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <div class="walkin-search-card">
              <p style="margin:0 0 8px 0; font-weight:600; color:#0F172A; font-family:'Outfit',sans-serif;">🔍 Search Existing Patient Database</p>
              <div class="search-input-wrapper" style="display:flex; gap:6px; margin-bottom:10px;">
                <input type="text" id="existing-search-input" class="walkin-input" placeholder="Enter patient name or ID..." value="Priya Verma">
                <button class="walkin-submit-btn" style="width:auto; padding:0 14px;" onclick="searchExistingPatient()">Search</button>
              </div>
              <div id="search-results-box" class="search-results-box">
                <div class="search-result-item" onclick="selectExistingPatient('Priya Verma', 'PAT-88219')">
                  <div style="font-family:'Outfit',sans-serif; font-size:13px;"><strong>Priya Verma</strong> (ID: PAT-88219)</div>
                  <div style="font-size:11px; color:#64748B;">Last visit: 3 weeks ago &bull; Dental</div>
                </div>
                <div class="search-result-item" onclick="selectExistingPatient('Vikram Malhotra', 'PAT-94012')">
                  <div style="font-family:'Outfit',sans-serif; font-size:13px;"><strong>Vikram Malhotra</strong> (ID: PAT-94012)</div>
                  <div style="font-size:11px; color:#64748B;">Last visit: 1 month ago &bull; Cardiology</div>
                </div>
                <div class="no-match-box" style="margin-top:8px; padding-top:8px; border-top:1px dashed #E2E8F0; display:flex; align-items:center; justify-content:space-between;">
                  <span style="font-size:11.5px; color:#64748B;">No match found?</span>
                  <button class="smart-sug-pill" onclick="executeScenarioPill('WALKIN_NEW_PATIENT', '+ Add New Patient')">➕ Add New Patient</button>
                </div>
              </div>
            </div>
            <span class="chat-time">Just now</span>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
    // Practice Coordinator Quick Menu Card Handler
    case 'SHOW_MORE_OPTIONS':
      changeMiloEmotion('focused');
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/milo_reviewing.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; padding:14px; width:100%; box-sizing:border-box; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <h4 style="margin:0 0 10px 0; font-family:'Outfit',sans-serif; font-size:14px; color:#0F172A;">💡 Practice Coordinator Quick Menu</h4>
              <div style="display:flex; flex-direction:column; gap:6px;">
                <button class="smart-sug-pill" style="justify-content:flex-start;" onclick="executeScenarioPill('GOTO_STATE_2', 'Who is my first appointment today?')">📅 Who is my first appointment today?</button>
                <button class="smart-sug-pill" style="justify-content:flex-start;" onclick="executeScenarioPill('SHOW_PATIENT_LIST', 'Show full patient list')">📋 Show full patient list</button>
                <button class="smart-sug-pill" style="justify-content:flex-start;" onclick="executeScenarioPill('TRIGGER_ARRIVAL_CHECK', 'Check if patient arrived in lobby')">📍 Check if patient arrived in lobby</button>
                <button class="smart-sug-pill" style="justify-content:flex-start;" onclick="executeScenarioPill('SEND_SMS_REMINDER', 'Send SMS reminder to patient')">💬 Send SMS reminder to patient</button>
                <button class="smart-sug-pill" style="justify-content:flex-start;" onclick="executeScenarioPill('SWAP_SLOTS_WITH_NEXT', 'Swap slot with next waiting patient')">⇄ Swap slot with next waiting patient</button>
                <button class="smart-sug-pill primary-green" style="justify-content:flex-start;" onclick="executeScenarioPill('ADD_WALKIN', 'Add Walk-in Patient')">➕ Add Walk-in Patient</button>
                <button class="smart-sug-pill" style="justify-content:flex-start;" onclick="executeScenarioPill('NOTIFY_15M_DELAY', 'Notify waiting patients of delay')">⚠️ Notify waiting patients of 15-min delay</button>
                <button class="smart-sug-pill" style="justify-content:flex-start;" onclick="executeScenarioPill('OPEN_CLINICAL_NOTES', 'Add clinical notes')">📝 Add clinical notes</button>
              </div>
            </div>
            <span class="chat-time">Just now</span>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      break;
  }
}

// Global Draft Object for Walk-in Workflow
let walkinDraft = {
  isNew: true,
  name: 'Ananya Roy',
  age: '34 Yrs',
  loc: 'Sector 5, City',
  notes: 'Sudden severe headache & mild fever',
  id: '',
  slotAssigned: 'Next Available'
};

// Submit New Walk-in Patient (Step 2A -> proceeds to Step 3 Slot Selection)
function submitNewWalkinPatient() {
  const name = document.getElementById('walkin-name')?.value || 'Ananya Roy';
  const age = document.getElementById('walkin-age')?.value || '34 Yrs';
  const loc = document.getElementById('walkin-loc')?.value || 'Sector 5, City';
  const notes = document.getElementById('walkin-notes')?.value || 'Sudden severe headache & mild fever';

  walkinDraft = { isNew: true, name, age, loc, notes, id: '', slotAssigned: '' };
  renderWalkinSlotSelection();
}

// Search Existing Patient (Step 2B)
function searchExistingPatient() {
  const query = (document.getElementById('existing-search-input')?.value || '').toLowerCase();
  const box = document.getElementById('search-results-box');
  if (!box) return;

  if (query.includes('priya')) {
    box.innerHTML = `
      <div class="search-result-item" onclick="selectExistingPatient('Priya Verma', 'PAT-88219')">
        <div style="font-family:'Outfit',sans-serif; font-size:13px;"><strong>Priya Verma</strong> (ID: PAT-88219)</div>
        <div style="font-size:11px; color:#64748B;">Last visit: 3 weeks ago &bull; Dental</div>
      </div>
    `;
  } else if (query.includes('vikram')) {
    box.innerHTML = `
      <div class="search-result-item" onclick="selectExistingPatient('Vikram Malhotra', 'PAT-94012')">
        <div style="font-family:'Outfit',sans-serif; font-size:13px;"><strong>Vikram Malhotra</strong> (ID: PAT-94012)</div>
        <div style="font-size:11px; color:#64748B;">Last visit: 1 month ago &bull; Cardiology</div>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div style="padding:8px; font-size:12px; color:#EA580C; font-weight:600;">No existing patient record matched "${query}".</div>
      <div class="no-match-box" style="margin-top:8px; padding-top:8px; border-top:1px dashed #E2E8F0; display:flex; align-items:center; justify-content:space-between;">
        <span style="font-size:11.5px; color:#64748B;">Register as new patient?</span>
        <button class="smart-sug-pill primary-green" onclick="executeScenarioPill('WALKIN_NEW_PATIENT', '+ Add New Patient')">➕ Add New Patient</button>
      </div>
    `;
  }
}

// Select Existing Patient (Step 2B -> proceeds to Step 3 Slot Selection)
function selectExistingPatient(name, id) {
  walkinDraft = { isNew: false, name, id, age: '', loc: '', notes: '', slotAssigned: '' };
  renderWalkinSlotSelection();
}

// STEP 3: Slot Selection & Criticality (Applies to BOTH New & Existing)
function renderWalkinSlotSelection() {
  const pName = walkinDraft.name;
  const row = document.createElement('div');
  row.className = 'chat-bubble-row milo-bubble';
  row.innerHTML = `
    <img src="assets/milo/milo_caring.png" alt="Milo" class="chat-avatar">
    <div class="chat-bubble-content" style="width:100%;">
      <p><strong>Assign Criticality &amp; Slot Priority:</strong></p>
      <p style="font-size:12.5px; color:#475569; margin-top:4px;">Please select slot assignment priority for <strong>${pName}</strong>:</p>
      <div class="inline-btn-group" style="margin-top:10px; display:flex; flex-wrap:wrap; gap:6px;">
        <button class="smart-sug-pill primary-red" onclick="finalizeWalkinSlot('Immediate / Emergency')">🚨 Immediate / Emergency</button>
        <button class="smart-sug-pill primary-green" onclick="finalizeWalkinSlot('Next Available')">⚡ Next Available</button>
        <button class="smart-sug-pill" onclick="finalizeWalkinSlot('Specific Time Slot (10:30 AM)')">🕒 Specific Time Slot (10:30 AM)</button>
      </div>
      <span class="chat-time">Just now</span>
    </div>
  `;
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// STEP 4: System Confirmation Card & In-Chat Notification
function finalizeWalkinSlot(slotAssigned) {
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const row = document.createElement('div');
  row.className = 'system-alert-row';

  if (walkinDraft.isNew) {
    row.innerHTML = `
      <div class="system-alert-card">
        <div class="system-alert-header">
          <div class="system-alert-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>🔔 System Notification &bull; Today at ${nowTime}</span>
          </div>
        </div>
        <h4 class="system-alert-title">New Walk-in Patient Added &amp; Scheduled</h4>
        <div class="system-swap-details-box">
          <div class="swap-detail-item"><span class="detail-label">Patient Details:</span> <strong class="detail-value">Name: ${walkinDraft.name} &bull; Age: ${walkinDraft.age} &bull; Location: ${walkinDraft.loc}</strong></div>
          <div class="swap-detail-item"><span class="detail-label">Slot Assigned:</span> <strong class="detail-value">${slotAssigned}</strong></div>
          <div class="swap-detail-item"><span class="detail-label">Notes:</span> <strong class="detail-value">${walkinDraft.notes}</strong></div>
          <div class="swap-detail-item"><span class="detail-label">Status:</span> <span class="state-indicator-badge state-badge-checked" style="width:fit-content; margin-top:2px;">Confirmed in Queue</span></div>
        </div>
        <p class="system-alert-footer">Registered in clinic registry and synced with patient queue.</p>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="system-alert-card">
        <div class="system-alert-header">
          <div class="system-alert-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>🔔 System Notification &bull; Today at ${nowTime}</span>
          </div>
        </div>
        <h4 class="system-alert-title">Existing Walk-in Scheduled</h4>
        <div class="system-swap-details-box">
          <div class="swap-detail-item"><span class="detail-label">Patient:</span> <strong class="detail-value">${walkinDraft.name} (ID: ${walkinDraft.id})</strong></div>
          <div class="swap-detail-item"><span class="detail-label">Slot Assigned:</span> <strong class="detail-value">${slotAssigned}</strong></div>
          <div class="swap-detail-item"><span class="detail-label">Status:</span> <span class="state-indicator-badge state-badge-checked" style="width:fit-content; margin-top:2px;">Confirmed in Queue</span></div>
        </div>
        <p class="system-alert-footer">Appointment calendar updated and front desk notified.</p>
      </div>
    `;
  }

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  changeMiloEmotion('celebrating');
  updateTurnByTurnSuggestions();
}

function updateSuggestedActionsStrip() {
  updateTurnByTurnSuggestions();
}

// Master event router for stateful actions
function handleCareFlowAction(actionType) {
  const pName = patientCareFlow.activePatient.name;

  switch (actionType) {
    case 'CHECK_IN':
      appendChatMessage('user', `Mark ${pName} as Checked In`);
      patientCareFlow.state = 'CHECKED_IN';
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-checked">✓ Checked In</span><br>
          <strong>${pName}</strong> is checked in and waiting in the lobby for Room 2.
        `);
        updateSuggestedActionsStrip();
      }, 500);
      break;

    case 'VIEW_DETAILS':
      appendChatMessage('user', `View details for ${pName}`);
      setTimeout(() => {
        appendChatMessage('milo', `
          <strong>Patient Profile &ndash; ${pName}</strong><br>
          &bull; Age / Gender: 32 yrs &bull; Female<br>
          &bull; ID: #8831<br>
          &bull; Appointment: 9:30 AM &bull; Consultation & Dental Review<br>
          &bull; History: No drug allergies recorded. Last visit 6 months ago.
        `);
      }, 500);
      break;

    case 'WELCOME_NOTIF':
      appendChatMessage('user', `Send welcome notification to ${pName}`);
      setTimeout(() => {
        appendChatMessage('milo', `Welcome notification sent to <strong>${pName}</strong>: <em>"Welcome to CarePilot Clinic! Dr. Patel will call you shortly."</em>`);
      }, 500);
      break;

    case 'INFORM_WAIT':
      appendChatMessage('user', `Inform ${pName} to wait 5 minutes`);
      setTimeout(() => {
        appendChatMessage('milo', `Notification sent to lobby screen & patient app: <em>"${pName}, Dr. Patel is finishing up a consultation and will call you in 5 minutes."</em>`);
      }, 500);
      break;

    case 'START_CONSULTATION':
      appendChatMessage('user', `Start consultation with ${pName}`);
      patientCareFlow.state = 'IN_SESSION';
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-session">● In Consultation</span><br>
          Consultation started with <strong>${pName}</strong> in Room 2. Timer active.
        `);
        updateSuggestedActionsStrip();
      }, 500);
      break;

    case 'RESCHEDULE_INLINE':
    case 'SCHEDULE_FOLLOWUP':
      appendChatMessage('user', actionType === 'SCHEDULE_FOLLOWUP' ? `Schedule follow-up visit for ${pName}` : `Reschedule consultation for ${pName}`);
      setTimeout(() => {
        const row = document.createElement('div');
        row.className = 'chat-bubble-row milo-bubble';
        row.innerHTML = `
          <img src="assets/milo/Milo_overview.png" alt="Milo" class="chat-avatar">
          <div class="chat-bubble-content" style="width:100%;">
            <div class="inline-picker-card">
              <div class="inline-picker-header">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16A34A" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                <span>Select Date & Time for ${pName}</span>
              </div>
              <div class="picker-row">
                <label style="font-size:11px; font-weight:600; color:#475569;">Select Date:</label>
                <input type="date" value="2026-07-29" class="inline-date-input" id="resched-date">
                <label style="font-size:11px; font-weight:600; color:#475569; margin-top:6px;">Available Time Slots:</label>
                <div class="time-slots-grid">
                  <div class="time-slot-pill selected" onclick="selectTimeSlot(this)">9:30 AM</div>
                  <div class="time-slot-pill" onclick="selectTimeSlot(this)">11:00 AM</div>
                  <div class="time-slot-pill" onclick="selectTimeSlot(this)">2:30 PM</div>
                  <div class="time-slot-pill" onclick="selectTimeSlot(this)">4:00 PM</div>
                </div>
              </div>
              <div style="display:flex; justify-content:flex-end;">
                <button class="smart-sug-pill primary-green" onclick="confirmReschedule('${pName}')">Confirm & Save Schedule</button>
              </div>
            </div>
          </div>
        `;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      break;

    case 'NOTIFY_DELAY':
      appendChatMessage('user', `Notify waiting queue of schedule delay`);
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-lobby">⚠️ Broadcast Sent</span><br>
          Broadcast sent to <strong>Sarah Smith</strong> and waiting list: <em>"Dr. Patel is running approximately 10 minutes behind schedule. Thank you for your patience."</em>
        `);
      }, 500);
      break;

    case 'MORE_TIME':
      appendChatMessage('user', `Mark 15 minutes extra needed for ${pName}`);
      setTimeout(() => {
        appendChatMessage('milo', `Added <strong>+15 minutes</strong> to active session slot.`);
      }, 500);
      break;

    case 'COMPLETE_CONSULTATION':
      appendChatMessage('user', `Complete consultation with ${pName}`);
      patientCareFlow.state = 'COMPLETED';
      setTimeout(() => {
        appendChatMessage('milo', `
          <span class="state-indicator-badge state-badge-done">✓ Consultation Completed</span><br>
          Consultation closed for <strong>${pName}</strong>. You can now add clinical notes or schedule a follow-up.
        `);
        updateSuggestedActionsStrip();
      }, 500);
      break;

    case 'DRAFT_NOTES_BOX':
      const row = document.createElement('div');
      row.className = 'chat-bubble-row milo-bubble';
      row.innerHTML = `
        <img src="assets/milo/Milo_overview.png" alt="Milo" class="chat-avatar">
        <div class="chat-bubble-content" style="width:100%;">
          <p><strong>Clinical Notes &ndash; ${pName}</strong></p>
          <div class="note-editor-box">
            <textarea class="note-textarea" id="note-text-input" placeholder="Type clinical observations or click tags..."></textarea>
            <div class="quick-tags-strip">
              <span class="quick-tag-chip" onclick="appendTagToNote('Routine Checkup')">Routine Checkup</span>
              <span class="quick-tag-chip" onclick="appendTagToNote('BP Normal 120/80')">BP Normal 120/80</span>
              <span class="quick-tag-chip" onclick="appendTagToNote('Scaling & Polishing')">Scaling & Polishing</span>
              <span class="quick-tag-chip" onclick="appendTagToNote('Follow-up in 2 wks')">Follow-up in 2 wks</span>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button class="smart-sug-pill primary-green" onclick="saveClinicalNote('${pName}')">Save Notes</button>
            </div>
          </div>
        </div>
      `;
      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      break;

    case 'TRANSITION_NEXT':
      patientCareFlow.state = 'NEXT_PATIENT';
      appendChatMessage('user', `Move to next patient in queue`);
      setTimeout(() => {
        const nextP = patientCareFlow.nextPatient;
        appendChatMessage('milo', `
          <div class="next-patient-summary-card">
            <div class="next-patient-header">
              <div class="next-avatar-box">SS</div>
              <div>
                <h4 class="next-patient-title">${nextP.name}</h4>
                <p class="next-patient-sub">Scheduled: <strong>${nextP.time}</strong> &bull; ${nextP.reason}</p>
              </div>
            </div>
            <div class="intake-questions-box">
              <div class="intake-questions-title">Suggested Intake Questions:</div>
              <span class="intake-question-pill" onclick="appendChatMessage('user', 'Intake: Any new dental sensitivity?'); setTimeout(() => appendChatMessage('milo', 'Sarah Smith: No major sensitivity, mild gum tenderness on right side.'), 500);">Any new sensitivity?</span>
              <span class="intake-question-pill" onclick="appendChatMessage('user', 'Intake: Has flossing routine continued?'); setTimeout(() => appendChatMessage('milo', 'Sarah Smith: Flossing daily for last 3 weeks.'), 500);">Flossing routine?</span>
              <span class="intake-question-pill" onclick="appendChatMessage('user', 'Intake: Any medical history changes?'); setTimeout(() => appendChatMessage('milo', 'Sarah Smith: No changes in health or meds.'), 500);">Medical history changes?</span>
            </div>
          </div>
        `);
        updateSuggestedActionsStrip();
      }, 500);
      break;

    case 'CHECKIN_NEXT':
      patientCareFlow.activePatient = { ...patientCareFlow.nextPatient };
      patientCareFlow.state = 'CHECKED_IN';
      appendChatMessage('user', `Check in ${patientCareFlow.activePatient.name}`);
      setTimeout(() => {
        appendChatMessage('milo', `<strong>${patientCareFlow.activePatient.name}</strong> is checked in and ready in Room 1.`);
        updateSuggestedActionsStrip();
      }, 500);
      break;

    case 'ADD_WALKIN':
      appendChatMessage('user', `Add new walk-in patient`);
      setTimeout(() => {
        appendChatMessage('milo', `Walk-in patient registration form opened. New patient added to today's queue at <strong>11:45 AM</strong>.`);
      }, 500);
      break;

    case 'CANCEL_APPT':
      appendChatMessage('user', `Cancel appointment`);
      setTimeout(() => {
        appendChatMessage('milo', `Appointment cancelled. Slot freed and SMS notification sent.`);
      }, 500);
      break;
  }
}

// Inline Picker & Note helpers
function selectTimeSlot(el) {
  document.querySelectorAll('.time-slot-pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmReschedule(patientName) {
  const dateVal = document.getElementById('resched-date')?.value || '2026-07-29';
  const selectedTime = document.querySelector('.time-slot-pill.selected')?.innerText || '9:30 AM';
  appendChatMessage('milo', `Appointment rescheduled for <strong>${patientName}</strong> to <strong>${dateVal}</strong> at <strong>${selectedTime}</strong>. Confirmation notification dispatched!`);
}

function appendTagToNote(tagText) {
  const textarea = document.getElementById('note-text-input');
  if (textarea) {
    if (textarea.value) {
      textarea.value += `, ${tagText}`;
    } else {
      textarea.value = tagText;
    }
  }
}

function saveClinicalNote(patientName) {
  const textarea = document.getElementById('note-text-input');
  const noteContent = textarea?.value || "Routine checkup completed successfully.";
  appendChatMessage('user', `Saved note: "${noteContent}"`);
  setTimeout(() => {
    appendChatMessage('milo', `Clinical note recorded in EHR for <strong>${patientName}</strong>.`);
  }, 500);
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

// Bind Milo Top Header Navigation Buttons (Back & Close)
const miloBackBtn = document.getElementById('milo-back-home-btn');
const miloCloseBtn = document.getElementById('milo-close-home-btn');

if (miloBackBtn) {
  miloBackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setView('home');
  });
}

if (miloCloseBtn) {
  miloCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setView('home');
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
