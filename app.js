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

// --- Stateful Patient Care Flow & Contextual Smart Suggested Actions Engine ---

const patientCareFlow = {
  state: 'LOBBY', // States: 'LOBBY' (State A), 'CHECKED_IN' (State B), 'IN_SESSION' (State C), 'COMPLETED' (State D), 'NEXT_PATIENT' (State E)
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

// Continuous Turn-by-Turn Suggested Actions & Follow-up Generator
function updateTurnByTurnSuggestions(contextText = '') {
  const container = document.querySelector('.suggested-actions-strip');
  if (!container) return;

  const txt = (contextText || '').toLowerCase();
  let suggestions = [];

  if (txt.includes('checked in') || patientCareFlow.state === 'CHECKED_IN') {
    suggestions = [
      { label: 'Inform patient to wait in lobby', action: 'INFORM_WAIT' },
      { label: 'Start consultation now', action: 'START_CONSULTATION' },
      { label: 'Reschedule to another time/day', action: 'RESCHEDULE_INLINE' },
      { label: 'View patient history/notes', action: 'VIEW_DETAILS' }
    ];
  } else if (txt.includes('consultation started') || patientCareFlow.state === 'IN_SESSION') {
    suggestions = [
      { label: 'Notify next patient of delay', action: 'NOTIFY_DELAY' },
      { label: 'View chief complaints & vitals', action: 'VIEW_VITALS' },
      { label: 'Complete consultation & add notes', action: 'COMPLETE_CONSULTATION' }
    ];
  } else if (txt.includes('consultation closed') || txt.includes('completed') || patientCareFlow.state === 'COMPLETED') {
    suggestions = [
      { label: 'Add clinical notes', action: 'DRAFT_NOTES_BOX' },
      { label: 'Schedule follow-up appointment', action: 'SCHEDULE_FOLLOWUP' },
      { label: 'Call next patient: Sarah Smith', action: 'TRANSITION_NEXT' }
    ];
  } else if (txt.includes('next patient') || patientCareFlow.state === 'NEXT_PATIENT') {
    suggestions = [
      { label: 'Ask about current symptoms', action: 'INTAKE_SYMPTOMS' },
      { label: 'Check recent lab results', action: 'CHECK_LABS' },
      { label: 'Mark as Arrived', action: 'CHECKIN_NEXT' },
      { label: 'Cancel / Reschedule', action: 'RESCHEDULE_INLINE' }
    ];
  } else {
    // Default / General Query Turn-by-Turn Suggestions
    suggestions = [
      { label: 'Summarize John Doe profile', action: 'SUMMARIZE_JOHN' },
      { label: 'View today\'s full schedule', action: 'SHOW_SCHEDULE' },
      { label: 'Add new walk-in patient', action: 'ADD_WALKIN' }
    ];
  }

  let pillsHTML = '';
  suggestions.forEach((sug, idx) => {
    const colorClass = idx === 0 ? 'primary-green' : '';
    pillsHTML += `
      <button class="smart-sug-pill ${colorClass}" onclick="executeSuggestedTurnPill('${sug.action}', '${sug.label.replace(/'/g, "\\'")}')">
        ${sug.label}
      </button>
    `;
  });

  container.innerHTML = pillsHTML;
}

function executeSuggestedTurnPill(actionKey, labelText) {
  // Post action into chat thread
  appendChatMessage('user', labelText);

  // Handle specific turn actions
  if (actionKey === 'SUMMARIZE_JOHN') {
    changeMiloEmotion('thinking');
    setTimeout(() => {
      changeMiloEmotion('reviewing');
      appendChatMessage('milo', getMiloResponse('john'));
    }, 600);
  } else if (actionKey === 'SHOW_SCHEDULE') {
    changeMiloEmotion('thinking');
    setTimeout(() => {
      changeMiloEmotion('happy');
      appendChatMessage('milo', getMiloResponse('schedule'));
    }, 600);
  } else if (actionKey === 'VIEW_VITALS') {
    setTimeout(() => {
      appendChatMessage('milo', `<strong>Chief Complaints & Vitals &ndash; Ritika Sharma:</strong><br>&bull; BP: 120/80 mmHg &bull; HR: 72 bpm &bull; Temp: 98.6°F<br>&bull; Reason: Routine dental cleaning & sensitivity evaluation.`);
    }, 500);
  } else if (actionKey === 'INTAKE_SYMPTOMS') {
    setTimeout(() => {
      appendChatMessage('milo', `<strong>Intake Symptoms &ndash; Sarah Smith:</strong><br>&bull; Mild sensitivity to cold beverages.<br>&bull; Last dental hygiene checkup: 6 months ago.`);
    }, 500);
  } else if (actionKey === 'CHECK_LABS') {
    setTimeout(() => {
      appendChatMessage('milo', `Here are the recent lab reports for <strong>Sarah Smith</strong>:<br>&bull; Panoramic X-Ray (Clean)<br>&bull; Blood Glucose: 95 mg/dL (Normal)`);
    }, 500);
  } else {
    // Route through state machine router
    handleCareFlowAction(actionKey);
  }
}

// Render contextual action pills inside suggested actions strip based on active state
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
