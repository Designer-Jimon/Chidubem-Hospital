// ==================== UTILITY FUNCTIONS ====================

function generateSerialNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CH-${year}-${random}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ==================== LOCAL STORAGE ====================

const DB = {
  patients: 'chidubem_patients',
  users: 'chidubem_users',
  
  get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  },
  
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  addPatient(patient) {
    const patients = this.get(this.patients);
    patient.id = Date.now();
    patient.createdAt = new Date().toISOString();
    patient.medicalRecords = [];
    patient.invoices = [];
    patients.push(patient);
    this.set(this.patients, patients);
    return patient;
  },
  
  getPatient(id) {
    const patients = this.get(this.patients);
    return patients.find(p => p.id === parseInt(id));
  },
  
  updatePatient(patient) {
    const patients = this.get(this.patients);
    const index = patients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      patients[index] = patient;
      this.set(this.patients, patients);
    }
    return patient;
  },
  
  addMedicalRecord(patientId, record) {
    const patient = this.getPatient(patientId);
    if (patient) {
      record.id = Date.now();
      patient.medicalRecords = patient.medicalRecords || [];
      patient.medicalRecords.unshift(record);
      this.updatePatient(patient);
    }
  },
  
  addInvoice(patientId, invoice) {
    const patient = this.getPatient(patientId);
    if (patient) {
      invoice.id = Date.now();
      invoice.date = new Date().toISOString();
      patient.invoices = patient.invoices || [];
      patient.invoices.unshift(invoice);
      this.updatePatient(patient);
    }
  },
  
  searchPatients(query) {
    const patients = this.get(this.patients);
    const q = query.toLowerCase();
    return patients.filter(p => 
      p.fullName.toLowerCase().includes(q) || 
      p.serialNumber.toLowerCase().includes(q)
    );
  }
};

// Initialize demo data
function initDemoData() {
  if (DB.get(DB.patients).length === 0) {
    const demoPatients = [
      {
        fullName: 'Amara Obi',
        age: '5',
        gender: 'Female',
        phone: '(555) 123-4567',
        address: '123 Oak Street, Springfield',
        serialNumber: 'CH-2026-0001',
        regDate: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        fullName: 'Kofi Mensah',
        age: '8',
        gender: 'Male',
        phone: '(555) 234-5678',
        address: '456 Maple Avenue, Springfield',
        serialNumber: 'CH-2026-0002',
        regDate: new Date(Date.now() - 86400000 * 15).toISOString()
      },
      {
        fullName: 'Zainab Ibrahim',
        age: '3',
        gender: 'Female',
        phone: '(555) 345-6789',
        address: '789 Pine Road, Springfield',
        serialNumber: 'CH-2026-0003',
        regDate: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ];
    
    demoPatients.forEach(p => {
      const patient = DB.addPatient(p);
      DB.addMedicalRecord(patient.id, {
        date: new Date(Date.now() - 86400000 * 30).toISOString(),
        diagnosis: 'Common Cold',
        treatment: 'Rest and fluids',
        notes: 'Follow up in 1 week'
      });
      DB.addInvoice(patient.id, {
        service: 'Consultation',
        amount: '150.00',
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        paymentDate: new Date(Date.now() - 86400000 * 30).toISOString()
      });
      DB.addInvoice(patient.id, {
        service: 'Vaccination',
        amount: '75.00',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Paid',
        paymentDate: new Date(Date.now() - 86400000 * 15).toISOString(),
        bankName: 'First Bank of Nigeria',
        tellerNumber: 'FB/2026/001234',
        senderAccount: 'John Obi'
      });
    });
  }
}

// ==================== AUTHENTICATION ====================

function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('chidubem_logged_in');
  const currentPage = window.location.pathname;
  
  if (!isLoggedIn && (currentPage.includes('dashboard') || currentPage.includes('patients') || currentPage.includes('patient-profile'))) {
    window.location.href = 'dashboard/login.html';
    return false;
  }
  return true;
}

function login(username, password) {
  if (username === 'chidubem' && password === 'chidubem') {
    sessionStorage.setItem('chidubem_logged_in', 'true');
    showNotification('Login successful!');
    setTimeout(() => window.location.href = 'dashboard.html', 500);
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem('chidubem_logged_in');
  window.location.href = 'dashboard/login.html';
}

// ==================== SLIDESHOW FUNCTIONS ====================

const slideshowIntervals = {};

function initSlideshows() {
  document.querySelectorAll('.slideshow-container').forEach(slideshow => {
    const id = slideshow.id;
    if (!id) return;
    
    // Hide all slides except first
    const slides = slideshow.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
      slide.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Start auto rotation
    if (slideshowIntervals[id]) clearInterval(slideshowIntervals[id]);
    slideshowIntervals[id] = setInterval(() => {
      changeSlide(1, id);
    }, 1000);
  });
}

function changeSlide(direction, slideshowId) {
  const slideshow = document.getElementById(slideshowId);
  if (!slideshow) return;
  
  const slides = slideshow.querySelectorAll('.slide');
  const dots = slideshow.querySelectorAll('.dot');
  let currentIndex = 0;
  
  slides.forEach((slide, index) => {
    if (slide.style.display === 'block') {
      currentIndex = index;
      slide.style.display = 'none';
    }
  });
  
  let newIndex = (currentIndex + direction + slides.length) % slides.length;
  slides[newIndex].style.display = 'block';
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === newIndex);
  });
}

function goToSlide(index, slideshowId) {
  const slideshow = document.getElementById(slideshowId);
  if (!slideshow) return;
  
  const slides = slideshow.querySelectorAll('.slide');
  const dots = slideshow.querySelectorAll('.dot');
  
  slides.forEach(slide => slide.style.display = 'none');
  dots.forEach(dot => dot.classList.remove('active'));
  
  slides[index].style.display = 'block';
  dots[index].classList.add('active');
  
  if (slideshowIntervals[slideshowId]) {
    clearInterval(slideshowIntervals[slideshowId]);
    slideshowIntervals[slideshowId] = setInterval(() => {
      changeSlide(1, slideshowId);
    }, 1000);
  }
}

// ==================== TESTIMONIAL SLIDER ====================

let currentSlide = 0;
const testimonials = [
  { text: "Chidubem Hospital took wonderful care of my daughter when she was sick. The staff was incredibly kind and patient.", name: "Sarah M.", relation: "Mother of Emily, 4" },
  { text: "The pediatric team here is exceptional. My son actually looks forward to his check-ups now!", name: "Michael R.", relation: "Father of James, 7" },
  { text: "Professional, caring, and thorough. Chidubem Hospital is our family's trusted healthcare partner.", name: "Jennifer L.", relation: "Mother of twins, 3" }
];

function initTestimonialSlider() {
  const container = document.querySelector('.testimonials-slider');
  if (!container) return;
  
  renderTestimonials();
  setInterval(() => {
    currentSlide = (currentSlide + 1) % testimonials.length;
    renderTestimonials();
  }, 1000);
}

function renderTestimonials() {
  const container = document.querySelector('.testimonials-slider');
  if (!container) return;
  
  container.innerHTML = testimonials.map((t, i) => `
    <div class="testimonial-card ${i === currentSlide ? 'active' : ''}">
      <div class="testimonial-avatar">👶</div>
      <p>"${t.text}"</p>
      <h4>${t.name}</h4>
      <span>${t.relation}</span>
    </div>
  `).join('') + `
    <div class="slider-controls">
      <button class="slider-btn" onclick="changeSlide(-1)">❮</button>
      <button class="slider-btn" onclick="changeSlide(1)">❯</button>
    </div>
  `;
}

function changeSlide(direction) {
  currentSlide = (currentSlide + direction + testimonials.length) % testimonials.length;
  renderTestimonials();
}

// ==================== DASHBOARD STATS ====================

function updateDashboardStats() {
  const patients = DB.get(DB.patients);
  const totalPatients = patients.length;
  
  let totalRevenue = 0;
  patients.forEach(p => {
    if (p.invoices) {
      p.invoices.forEach(inv => {
        totalRevenue += parseFloat(inv.amount) || 0;
      });
    }
  });
  
  const appointments = patients.length * 3; // Demo calculation
  
  document.querySelectorAll('.stat-value').forEach(el => {
    const type = el.dataset.type;
    if (type === 'patients') el.textContent = totalPatients;
    if (type === 'appointments') el.textContent = appointments;
    if (type === 'revenue') el.textContent = formatCurrency(totalRevenue);
  });
}

// ==================== PATIENT LIST ====================

function renderPatientList(filter = '') {
  const patients = filter ? DB.searchPatients(filter) : DB.get(DB.patients);
  const tbody = document.querySelector('#patientTableBody');
  if (!tbody) return;
  
  if (patients.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem;">
          No patients found
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = patients.map(p => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
            ${p.fullName.charAt(0)}
          </div>
          ${p.fullName}
        </div>
      </td>
      <td><code style="background: var(--bg-light); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">${p.serialNumber}</code></td>
      <td>${p.age} years</td>
      <td>${p.gender}</td>
      <td>${p.regDate ? formatDate(p.regDate) : 'N/A'}</td>
      <td><button class="action-btn view" onclick="viewPatient(${p.id})">View Profile</button></td>
    </tr>
  `).join('');
}

function viewPatient(id) {
  window.location.href = `patient-profile.html?id=${id}`;
}

// ==================== PATIENT PROFILE ====================

function renderPatientProfile(patientId) {
  const patient = DB.getPatient(patientId);
  if (!patient) {
    window.location.href = 'patients.html';
    return;
  }
  
  // Update header
  document.getElementById('patientName').textContent = patient.fullName;
  document.getElementById('patientSerial').textContent = patient.serialNumber;
  
  // Update details
  document.getElementById('detailAge').textContent = `${patient.age} years`;
  document.getElementById('detailGender').textContent = patient.gender;
  document.getElementById('detailPhone').textContent = patient.phone;
  document.getElementById('detailAddress').textContent = patient.address;
  document.getElementById('detailRegDate').textContent = patient.regDate ? formatDate(patient.regDate) : 'N/A';
  
  // Render medical records
  const recordsContainer = document.getElementById('medicalRecords');
  if (patient.medicalRecords && patient.medicalRecords.length > 0) {
    recordsContainer.innerHTML = patient.medicalRecords.map(r => `
      <div class="record-item">
        <div class="record-date">${formatDate(r.date)}</div>
        <h4>Diagnosis: ${r.diagnosis}</h4>
        <p><strong>Treatment:</strong> ${r.treatment}</p>
        <p><strong>Notes:</strong> ${r.notes}</p>
      </div>
    `).join('');
  } else {
    recordsContainer.innerHTML = '<p style="color: var(--text-light);">No medical records yet.</p>';
  }
  
  // Render invoices with clickable view button
  const invoicesContainer = document.getElementById('invoiceList');
  let totalBilled = 0;
  let totalPaid = 0;
  
  if (patient.invoices && patient.invoices.length > 0) {
    invoicesContainer.innerHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--bg-light);">
            <th style="padding: 1rem; text-align: left; font-size: 0.9rem;">Service</th>
            <th style="padding: 1rem; text-align: left; font-size: 0.9rem;">Method</th>
            <th style="padding: 1rem; text-align: left; font-size: 0.9rem;">Date</th>
            <th style="padding: 1rem; text-align: right; font-size: 0.9rem;">Amount</th>
            <th style="padding: 1rem; text-align: center; font-size: 0.9rem;">Status</th>
            <th style="padding: 1rem; text-align: center; font-size: 0.9rem;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${patient.invoices.map(i => {
            const amount = parseFloat(i.amount) || 0;
            totalBilled += amount;
            if (i.paymentStatus === 'Paid') totalPaid += amount;
            
            const paymentMethodIcon = i.paymentMethod === 'Bank Transfer' ? '🏦' : '💵';
            
            return `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem;"><strong>${i.service}</strong></td>
                <td style="padding: 1rem;">${paymentMethodIcon} ${i.paymentMethod || 'Cash'}</td>
                <td style="padding: 1rem; color: var(--text-light);">${formatDate(i.paymentDate || i.date)}</td>
                <td style="padding: 1rem; text-align: right; font-weight: 600; color: var(--primary);">${formatCurrency(amount)}</td>
                <td style="padding: 1rem; text-align: center;">
                  <span style="background: #E8F5E9; color: #4CAF50; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">${i.paymentStatus || 'Paid'}</span>
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <button class="action-btn view" onclick="viewPaymentDetails(${i.id})" style="background: var(--accent); font-size: 0.8rem;">👁️ View</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } else {
    invoicesContainer.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">No payment records yet. Click "Add Payment" to record a payment.</p>';
  }
  
  // Update payment summary
  const balance = totalBilled - totalPaid;
  document.getElementById('totalBilled').textContent = formatCurrency(totalBilled);
  document.getElementById('totalPaid').textContent = formatCurrency(totalPaid);
  document.getElementById('totalBalance').textContent = formatCurrency(balance);
  
  // Store patient ID for forms
  document.getElementById('patientId').value = patientId;
}

// ==================== FORM HANDLERS ====================

function handleAddPatient(e) {
  e.preventDefault();
  
  const form = e.target;
  const patient = {
    fullName: form.fullName.value,
    age: form.age.value,
    gender: form.gender.value,
    phone: form.phone.value,
    address: form.address.value,
    regDate: form.regDate.value || new Date().toISOString(),
    serialNumber: generateSerialNumber()
  };
  
  DB.addPatient(patient);
  showNotification('Patient added successfully!');
  form.reset();
  document.getElementById('regDate').valueAsDate = new Date();
  closeModal('addPatientModal');
  renderPatientList();
}

function handleAddRecord(e) {
  e.preventDefault();
  
  const form = e.target;
  const patientId = document.getElementById('patientId').value;
  
  DB.addMedicalRecord(patientId, {
    date: form.recordDate.value || new Date().toISOString(),
    diagnosis: form.diagnosis.value,
    treatment: form.treatment.value,
    notes: form.notes.value
  });
  
  showNotification('Medical record added!');
  form.reset();
  document.getElementById('recordDate').valueAsDate = new Date();
  closeModal('addRecordModal');
  renderPatientProfile(patientId);
}

function handleAddPayment(e) {
  e.preventDefault();
  
  const form = e.target;
  const patientId = document.getElementById('patientId').value;
  
  const invoice = {
    service: form.service.value,
    amount: form.amount.value,
    paymentMethod: form.paymentMethod.value,
    paymentStatus: 'Paid',
    paymentDate: form.paymentDate.value,
    tellerNumber: form.tellerNumber ? form.tellerNumber.value : '',
    senderAccount: form.senderAccount ? form.senderAccount.value : '',
    bankName: form.bankName ? form.bankName.value : '',
    notes: form.paymentNotes ? form.paymentNotes.value : ''
  };
  
  DB.addInvoice(patientId, invoice);
  showNotification('Payment recorded successfully!');
  form.reset();
  document.getElementById('paymentDate').valueAsDate = new Date();
  document.getElementById('bankTransferFields').style.display = 'none';
  closeModal('addPaymentModal');
  renderPatientProfile(patientId);
  updateDashboardStats();
}

// ==================== MODAL ====================

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// ==================== TABS ====================

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
  initDemoData();
  
  // Auto render patient list if on patients page
  if (document.querySelector('#patientTableBody')) {
    renderPatientList();
  }
  
  // Auto render dashboard stats
  if (document.querySelector('.stats-grid')) {
    updateDashboardStats();
  }
  
  // Auto render testimonial slider
  initTestimonialSlider();
  
  // Search functionality
  const searchInput = document.querySelector('#patientSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderPatientList(e.target.value);
    });
  }
});
