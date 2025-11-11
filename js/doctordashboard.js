// doctordashboard.js
// This file provides interactive fake-data driven behavior for the doctor dashboard.
// Replace fake-data usage with real API calls later.

(() => {
  // Helper DOM getters
  const $ = (sel) => document.querySelector(sel);
  const appointmentsContainer = $('#appointmentsContainer');
  const videoToggle = $('#videoToggle');
  const videoStatusText = $('#videoStatusText');
  const spinner = $('#spinner');
  const searchInput = $('#searchInput');
  const filterSelect = $('#filterSelect');
  const refreshBtn = $('#refreshBtn');

  const modalDiv = $('#modalDiv');
  const modalClose = $('#modalClose');
  const modalBody = $('#modalBody');
  const modalTitle = $('#modalTitle');
  const modalAccept = $('#modalAccept');
  const modalDecline = $('#modalDecline');

  // Dummy dataset (used for demo). In production, call backend API and set this data.
  const DEFAULT_APPOINTMENTS = [
    { id: 'a1', patient: 'Ravi Kumar', time: '2025-11-12 10:30', reason: 'Chest pain', phone: '9876543210', status: 'pending', notes: 'Follow-up after ECG' },
    { id: 'a2', patient: 'Sita Devi', time: '2025-11-12 12:00', reason: 'Cough & Cold', phone: '9123456780', status: 'accepted', notes: 'Prescribed medication last visit' },
    { id: 'a3', patient: 'Manish Patel', time: '2025-11-13 09:00', reason: 'Routine Checkup', phone: '9012345678', status: 'pending', notes: 'Diabetic patient' },
  ];

  // Save/Load appointments from localStorage for persistence between reloads
  const loadAppointments = () => {
    const raw = localStorage.getItem('mp_appointments');
    if (!raw) {
      localStorage.setItem('mp_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
      return DEFAULT_APPOINTMENTS.slice();
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      localStorage.setItem('mp_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
      return DEFAULT_APPOINTMENTS.slice();
    }
  };

  const saveAppointments = (arr) => {
    localStorage.setItem('mp_appointments', JSON.stringify(arr));
  };

  // Render helpers
  const renderAppointments = (list) => {
    appointmentsContainer.innerHTML = '';
    if (!list.length) {
      appointmentsContainer.innerHTML = `<div style="padding:18px;background:#fff;border-radius:12px;text-align:center;color:var(--muted)">No appointments found</div>`;
      return;
    }
    list.forEach(appt => {
      const card = document.createElement('div');
      card.className = 'appointment-card';
      card.innerHTML = `
        <div class="appointment-left">
          <div class="patient-avatar">${appt.patient.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
          <div class="appointment-meta">
            <b>${appt.patient}</b>
            <div style="color:var(--muted)">${appt.reason}</div>
            <div style="font-size:13px;color:var(--muted);margin-top:6px">${appt.time}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="status ${appt.status}">${appt.status}</div>
          <div class="appointment-actions">
            <button class="btn ghost view-btn" data-id="${appt.id}">View Details</button>
            <button class="btn accept accept-btn" data-id="${appt.id}">Accept</button>
            <button class="btn decline decline-btn" data-id="${appt.id}">Decline</button>
          </div>
        </div>
      `;
      appointmentsContainer.appendChild(card);
    });

    // attach handlers
    document.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openModalFor(id);
    }));
    document.querySelectorAll('.accept-btn').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      updateStatus(id, 'accepted');
    }));
    document.querySelectorAll('.decline-btn').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      updateStatus(id, 'declined');
    }));
  };

  // Modal helpers
  let currentModalId = null;
  const openModalFor = (id) => {
    const appts = loadAppointments();
    const appt = appts.find(a => a.id === id);
    if (!appt) return;
    currentModalId = id;
    modalTitle.textContent = `Appointment — ${appt.patient}`;
    modalBody.innerHTML = `
      <div style="grid-column:1/3"><strong>Reason:</strong> ${appt.reason}</div>
      <div><strong>Date/Time</strong><div style="color:var(--muted)">${appt.time}</div></div>
      <div><strong>Phone</strong><div style="color:var(--muted)">${appt.phone}</div></div>
      <div style="grid-column:1/3;margin-top:8px"><strong>Notes:</strong><div style="color:var(--muted)">${appt.notes}</div></div>
    `;
    modalDiv.style.display = 'flex';
  };

  const closeModal = () => {
    modalDiv.style.display = 'none';
    currentModalId = null;
  };

  // status update
  const updateStatus = (id, status) => {
    const appts = loadAppointments();
    const idx = appts.findIndex(a => a.id === id);
    if (idx === -1) return;
    appts[idx].status = status;
    saveAppointments(appts);
    toast(`Appointment marked ${status}`);
    doRefresh();
    // If modal was open for this id, update it
    if (currentModalId === id) {
      closeModal();
    }
  };

  // small toast helper
  const toast = (msg) => {
    // reuse spinner element briefly as simple toast for now
    spinner.textContent = '✓';
    spinner.style.display = 'flex';
    setTimeout(()=> { spinner.style.display = 'none'; spinner.textContent = '⟳'; }, 900);
    console.log(msg);
  };

  // Searching & filtering
  const doFilterSearch = () => {
    const all = loadAppointments();
    const q = (searchInput.value || '').toLowerCase().trim();
    const status = filterSelect.value;
    let filtered = all.filter(a => {
      const matchQ = !q || a.patient.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q);
      const matchStatus = status === 'all' ? true : a.status === status;
      return matchQ && matchStatus;
    });
    renderAppointments(filtered);
  };

  const doRefresh = () => {
    // simulate small loading
    spinner.style.display = 'flex';
    setTimeout(()=> {
      spinner.style.display = 'none';
      doFilterSearch();
    }, 300);
  };

  // initialize UI state (video available and doctor name)
  const init = () => {
    // doctor info (from localStorage or fake)
    const docName = localStorage.getItem('name') || 'Dr. Ananya';
    $('#doctorName').textContent = docName;
    $('#doctorSpecialty').textContent = localStorage.getItem('specialty') || 'General Physician';

    // video availability persisted
    const vid = localStorage.getItem('mp_video_available') === 'true';
    videoToggle.checked = vid;
    videoStatusText.textContent = vid ? 'On' : 'Off';

    // event listeners
    videoToggle.addEventListener('change', (e) => {
      const on = e.target.checked;
      localStorage.setItem('mp_video_available', on);
      videoStatusText.textContent = on ? 'On' : 'Off';
      toast('Video availability updated');
    });

    searchInput.addEventListener('input', () => doFilterSearch());
    filterSelect.addEventListener('change', () => doFilterSearch());
    refreshBtn.addEventListener('click', () => doRefresh());

    modalClose.addEventListener('click', closeModal);
    modalDiv.addEventListener('click', (ev) => {
      if (ev.target === modalDiv) closeModal();
    });

    modalAccept.addEventListener('click', () => { if (currentModalId) updateStatus(currentModalId, 'accepted'); });
    modalDecline.addEventListener('click', () => { if (currentModalId) updateStatus(currentModalId, 'declined'); });

    // logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token'); localStorage.removeItem('name'); localStorage.removeItem('id');
        // go to signin
        window.location.href = './signin.html';
      });
    }

    // initial render
    doRefresh();
  };

  // Kickoff
  init();

})();
