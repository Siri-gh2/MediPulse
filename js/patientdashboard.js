// patientdashboard.js
// Demo-first patient dashboard: appointments + doctors + booking (localStorage)

(() => {
  const $ = (s) => document.querySelector(s);
  const appointmentsList = $('#appointmentsList');
  const doctorsGrid = $('#doctorsGrid');
  const doctorSearch = $('#doctorSearch');
  const specialtyFilter = $('#specialtyFilter');
  const refreshDoctors = $('#refreshDoctors');
  const modalDiv = $('#modalDiv');
  const modalBody = $('#modalBody');
  const modalTitle = $('#modalTitle');
  const modalClose = $('#modalClose');
  const modalAction = $('#modalAction');
  const modalCancel = $('#modalCancel');
  const spinner = $('#spinner');

  // Demo doctors (replace with backend data later)
  const DEFAULT_DOCTORS = [
    { id: 'd1', name: 'Dr. Ananya Rao', specialty: 'Cardiology', fee: 500, avatar: 'https://media.istockphoto.com/id/1861987838/photo/smiling-female-doctor-looking-at-camera-in-the-medical-consultation.webp?a=1&b=1&s=612x612&w=0&k=20&c=um_usOsshRUn1qaLFF-5wyD9u_A4Wj2BhOFW2xsrkJ8=' },
    { id: 'd2', name: 'Dr. Vikram Singh', specialty: 'Dermatology', fee: 400, avatar: 'https://images.pexels.com/photos/4173257/pexels-photo-4173257.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'd3', name: 'Dr. Meera Shah', specialty: 'General Physician', fee: 300, avatar: 'https://images.pexels.com/photos/3845766/pexels-photo-3845766.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'd4', name: 'Dr. Rahul Patel', specialty: 'Pediatrics', fee: 350, avatar: 'https://images.pexels.com/photos/5212352/pexels-photo-5212352.jpeg?auto=compress&cs=tinysrgb&w=600' }
  ];

  // appointments demo store
  const loadAppointments = () => {
    const raw = localStorage.getItem('mp_patient_appointments');
    if (!raw) {
      localStorage.setItem('mp_patient_appointments', JSON.stringify([]));
      return [];
    }
    try { return JSON.parse(raw); } catch(e){ localStorage.setItem('mp_patient_appointments', JSON.stringify([])); return []; }
  };
  const saveAppointments = (arr) => localStorage.setItem('mp_patient_appointments', JSON.stringify(arr));

  // doctors store
  const loadDoctors = () => {
    const raw = localStorage.getItem('mp_doctors');
    if (!raw) {
      localStorage.setItem('mp_doctors', JSON.stringify(DEFAULT_DOCTORS));
      return DEFAULT_DOCTORS.slice();
    }
    try { return JSON.parse(raw); } catch(e){ localStorage.setItem('mp_doctors', JSON.stringify(DEFAULT_DOCTORS)); return DEFAULT_DOCTORS.slice(); }
  };
  const saveDoctors = (arr) => localStorage.setItem('mp_doctors', JSON.stringify(arr));

  // render appointments
  const renderAppointments = () => {
    const list = loadAppointments();
    appointmentsList.innerHTML = '';
    if (!list.length) {
      appointmentsList.innerHTML = `<div style="padding:12px;color:var(--muted)">You have no scheduled appointments.</div>`;
      return;
    }
    list.forEach(a => {
      const el = document.createElement('div');
      el.className = 'appointment-card';
      el.innerHTML = `
        <div>
          <b>${a.doctorName}</b>
          <div style="color:var(--muted)">${a.date} • ${a.time}</div>
          <div style="font-size:13px;color:var(--muted);margin-top:6px">${a.reason || 'General consultation'}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <div style="font-weight:700">${a.status || 'booked'}</div>
          <button class="btn ghost view-apt" data-id="${a.id}">View</button>
          <button class="btn" data-id="${a.id}" onclick="if(confirm('Cancel appointment?')){ (function(id){ const arr=JSON.parse(localStorage.getItem('mp_patient_appointments')||'[]'); localStorage.setItem('mp_patient_appointments', JSON.stringify(arr.filter(x=>x.id!==id))); location.reload(); })('${a.id}')}">Cancel</button>
        </div>
      `;
      appointmentsList.appendChild(el);
    });

    // attach view handlers
    document.querySelectorAll('.view-apt').forEach(b => b.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      openAptModal(id);
    }));
  };

  // render doctors
  const renderDoctors = (list) => {
    doctorsGrid.innerHTML = '';
    if (!list.length) {
      doctorsGrid.innerHTML = `<div style="padding:12px;color:var(--muted)">No doctors found</div>`;
      return;
    }
    list.forEach(d => {
      const card = document.createElement('div');
      card.className = 'doctor-card';
      card.innerHTML = `
        <img src="${d.avatar}" alt="${d.name}">
        <div style="font-weight:700">${d.name}</div>
        <div class="meta">${d.specialty} • ₹${d.fee}</div>
        <div style="margin-top:auto;display:flex;gap:8px">
          <button class="btn ghost details-btn" data-id="${d.id}">Details</button>
          <button class="btn primary book-btn" data-id="${d.id}">Book</button>
        </div>
      `;
      doctorsGrid.appendChild(card);
    });

    document.querySelectorAll('.details-btn').forEach(b => b.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      openDoctorModal(id);
    }));
    document.querySelectorAll('.book-btn').forEach(b => b.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      startBooking(id);
    }));
  };

  // modal helpers
  let modalContext = null; // {type:'doctor'|'appointment', id:...}
  const openDoctorModal = (id) => {
    const docs = loadDoctors();
    const doc = docs.find(d=>d.id===id);
    if(!doc) return;
    modalContext = {type:'doctor', id};
    modalTitle.textContent = doc.name;
    modalBody.innerHTML = `<div style="display:grid;gap:8px">
      <div><strong>Specialty:</strong> ${doc.specialty}</div>
      <div><strong>Consultation Fee:</strong> ₹${doc.fee}</div>
      <div style="margin-top:8px"><strong>About:</strong> Experienced ${doc.specialty} with several years of practice.</div>
    </div>`;
    modalAction.textContent = 'Book Appointment';
    modalDiv.style.display = 'flex';
  };

  const openAptModal = (id) => {
    const appts = loadAppointments();
    const a = appts.find(x=>x.id===id);
    if(!a) return;
    modalContext = {type:'appointment', id};
    modalTitle.textContent = `Appointment — ${a.doctorName}`;
    modalBody.innerHTML = `<div style="display:grid;gap:8px">
      <div><strong>Patient:</strong> ${a.patientName}</div>
      <div><strong>Doctor:</strong> ${a.doctorName}</div>
      <div><strong>Date/Time:</strong> ${a.date} • ${a.time}</div>
      <div><strong>Reason:</strong> ${a.reason || 'General'}</div>
      <div><strong>Status:</strong> ${a.status || 'booked'}</div>
    </div>`;
    modalAction.textContent = 'Close';
    modalDiv.style.display = 'flex';
  };

  const closeModal = () => {
    modalDiv.style.display = 'none';
    modalContext = null;
  };

  // booking flow (simple)
  const startBooking = (doctorId) => {
    const docs = loadDoctors();
    const doc = docs.find(d=>d.id===doctorId);
    if(!doc) return;
    modalContext = {type:'booking', id:doctorId};
    modalTitle.textContent = `Book with ${doc.name}`;
    modalBody.innerHTML = `
      <div style="display:grid;gap:8px">
        <div><strong>Specialty:</strong> ${doc.specialty}</div>
        <div><strong>Fee:</strong> ₹${doc.fee}</div>
        <label>Date <input id="bookDate" type="date"></label>
        <label>Time <input id="bookTime" type="time"></label>
        <label>Reason <input id="bookReason" placeholder="Reason (optional)"></label>
      </div>
    `;
    modalAction.textContent = 'Confirm Booking';
    modalDiv.style.display = 'flex';
  };

  const confirmBooking = () => {
    if(!modalContext || modalContext.type!=='booking') { closeModal(); return; }
    const docId = modalContext.id;
    const doc = loadDoctors().find(d=>d.id===docId);
    const date = $('#bookDate').value;
    const time = $('#bookTime').value;
    const reason = $('#bookReason').value || '';
    if(!date || !time) { alert('Please select date and time'); return; }

    // create appointment
    const appts = loadAppointments();
    const newA = {
      id: 'apt-' + Date.now(),
      patientName: localStorage.getItem('name') || 'Patient',
      patientId: localStorage.getItem('id') || 'local-patient',
      doctorId: doc.id,
      doctorName: doc.name,
      date,
      time,
      reason,
      status: 'booked'
    };
    appts.unshift(newA);
    saveAppointments(appts);
    toast('Appointment booked');
    closeModal();
    renderAppointments();
  };

  // small toast via spinner
  const toast = (msg) => {
    spinner.textContent = '✓';
    spinner.style.display = 'flex';
    setTimeout(()=> { spinner.style.display = 'none'; spinner.textContent = '⟳'; }, 900);
    console.log(msg);
  };

  // search & filter helpers
  const doDoctorsFilter = () => {
    const q = (doctorSearch.value || '').toLowerCase().trim();
    const specialty = specialtyFilter.value;
    const all = loadDoctors();
    const filtered = all.filter(d => {
      const matchQ = !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
      const matchSpec = specialty === 'all' ? true : d.specialty === specialty;
      return matchQ && matchSpec;
    });
    renderDoctors(filtered);
  };

  const init = () => {
    // load initial doctors into specialty dropdown
    const docs = loadDoctors();
    const uniqueSpecs = [...new Set(docs.map(d=>d.specialty))];
    uniqueSpecs.forEach(s => {
      const opt = document.createElement('option'); opt.value = s; opt.textContent = s; specialtyFilter.appendChild(opt);
    });

    // patient info
    $('#patientName').textContent = localStorage.getItem('name') || 'Patient';
    $('#patientEmail').textContent = localStorage.getItem('email') || '';

    // events
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalDiv.addEventListener('click', (ev)=> { if(ev.target === modalDiv) closeModal(); });

    modalAction.addEventListener('click', ()=>{
      if(!modalContext) { closeModal(); return; }
      if(modalContext.type === 'booking') confirmBooking();
      else closeModal();
    });

    doctorSearch.addEventListener('input', doDoctorsFilter);
    specialtyFilter.addEventListener('change', doDoctorsFilter);
    refreshDoctors.addEventListener('click', ()=> { saveDoctors(DEFAULT_DOCTORS); doDoctorsFilter(); toast('Doctors refreshed'); });

    // logout
    const logoutBtn = $('#logoutBtn');
    if(logoutBtn) logoutBtn.addEventListener('click', ()=> {
      localStorage.removeItem('token'); localStorage.removeItem('name'); localStorage.removeItem('id');
      window.location.href = './signin.html';
    });

    // initial render
    renderAppointments();
    doDoctorsFilter();
  };

  init();
})();
