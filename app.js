```javascript
/*************************************************
 * KOST PUTRI MANAGEMENT SYSTEM
 * APP.JS - FINAL REVISION
 * GitHub Pages → Google Apps Script → Google Sheets
 *************************************************/


/* =================================================
   CONFIG
   ================================================= */

const API_URL =
  'https://script.google.com/macros/s/AKfycbyQKGeA74rDh6jv1aQn2t0wAoIxmA2lhIlVY_ToR6gsX0sBWygwvLGMiXnMIO0OFjJWzw/exec';


/* =================================================
   LOGIN CONFIG
   ================================================= */

const LOGIN_KEY = 'kostLogin';
const USER_KEY = 'kostUser';


/* =================================================
   API GET - JSONP
   ================================================= */

function apiGet(action, params) {

  params = params || {};

  return new Promise(function(resolve, reject) {

    const callbackName =
      'kostCallback_' +
      Date.now() +
      '_' +
      Math.floor(Math.random() * 100000);

    const script =
      document.createElement('script');

    let finished = false;

    const query =
      new URLSearchParams();

    query.append(
      'action',
      action
    );

    query.append(
      'callback',
      callbackName
    );

    Object.keys(params).forEach(function(key) {

      const value = params[key];

      if (
        value !== undefined &&
        value !== null
      ) {

        query.append(
          key,
          value
        );

      }

    });


    let timeout;


    window[callbackName] =
      function(data) {

        if (finished) {
          return;
        }

        finished = true;

        clearTimeout(timeout);

        delete window[callbackName];

        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }

        resolve(data);

      };


    script.src =
      API_URL +
      '?' +
      query.toString();

    script.async = true;


    script.onerror =
      function() {

        if (finished) {
          return;
        }

        finished = true;

        clearTimeout(timeout);

        delete window[callbackName];

        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }

        reject(
          new Error(
            'Gagal menghubungkan ke Google Apps Script.'
          )
        );

      };


    document.head.appendChild(script);


    timeout =
      setTimeout(function() {

        if (finished) {
          return;
        }

        finished = true;

        delete window[callbackName];

        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }

        reject(
          new Error(
            'API timeout. Google Apps Script tidak merespons.'
          )
        );

      }, 20000);

  });

}


/* =================================================
   API POST
   ================================================= */

async function apiPost(data) {

  data = data || {};

  const payload =
    Object.assign({}, data);

  const action =
    payload.action || '';

  delete payload.action;

  return apiGet(
    action,
    payload
  );

}


/* =================================================
   TEST API
   ================================================= */

async function testAPI() {

  const result =
    await apiGet('test');

  console.log(
    'API TEST:',
    result
  );

  return result;

}


/* =================================================
   LOGIN
   ================================================= */

function isLoggedIn() {

  return (
    localStorage.getItem(LOGIN_KEY) === 'true'
  );

}


function getCurrentUser() {

  return localStorage.getItem(USER_KEY) || '';

}


function showLoginPage() {

  const loginPage =
    document.getElementById('loginPage');

  const appContainer =
    document.getElementById('appContainer');


  if (loginPage) {

    loginPage.style.display =
      'flex';

  }


  if (appContainer) {

    appContainer.style.display =
      'none';

  }

}


function showAppPage() {

  const loginPage =
    document.getElementById('loginPage');

  const appContainer =
    document.getElementById('appContainer');


  if (loginPage) {

    loginPage.style.display =
      'none';

  }


  if (appContainer) {

    appContainer.style.display =
      'flex';

  }

}


function loginUser(event) {

  if (event) {
    event.preventDefault();
  }


  const username =
    getValue('loginUsername').trim();

  const password =
    getValue('loginPassword');


  const errorElement =
    document.getElementById('loginError');


  /*
   * LOGIN SEMENTARA / LOCAL
   *
   * Username:
   * admin
   *
   * Password:
   * admin123
   */

  if (
    username === 'admin' &&
    password === 'admin123'
  ) {

    localStorage.setItem(
      LOGIN_KEY,
      'true'
    );

    localStorage.setItem(
      USER_KEY,
      username
    );


    if (errorElement) {

      errorElement.textContent =
        '';

    }


    showAppPage();

    updateUserDisplay();

    initDashboardAfterLogin();

    return;

  }


  if (errorElement) {

    errorElement.textContent =
      'Username atau password salah.';

  }

}


function logoutUser() {

  localStorage.removeItem(
    LOGIN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );


  showLoginPage();


  const password =
    document.getElementById(
      'loginPassword'
    );

  if (password) {

    password.value =
      '';

  }

}


/* =================================================
   USER DISPLAY
   ================================================= */

function updateUserDisplay() {

  const username =
    getCurrentUser();


  const elements =
    document.querySelectorAll(
      '[data-user]'
    );


  elements.forEach(function(element) {

    element.textContent =
      username || 'Admin';

  });


  const userText =
    document.getElementById(
      'currentUser'
    );


  if (userText) {

    userText.textContent =
      username || 'Admin';

  }

}


/* =================================================
   DASHBOARD
   ================================================= */

async function loadDashboard() {

  try {

    const result =
      await apiGet(
        'dashboard'
      );


    console.log(
      'DASHBOARD:',
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : 'Gagal mengambil dashboard.'
      );

    }


    const data =
      result.data || {};


    setText(
      'totalKamar',
      data.totalKamar || 0
    );


    setText(
      'kamarTerisi',
      data.kamarTerisi || 0
    );


    setText(
      'kamarKosong',
      data.kamarKosong || 0
    );


    setText(
      'totalPenghuni',
      data.totalPenghuni || 0
    );


    setText(
      'bookingAktif',
      data.bookingAktif || 0
    );


    setText(
      'totalPendapatan',
      formatRupiah(
        data.totalPendapatan || 0
      )
    );


    setText(
      'dashboardMessage',
      'Data dashboard berhasil diperbarui.'
    );


    setApiStatus(true);


    return result;

  } catch (error) {

    console.error(
      'Dashboard error:',
      error
    );


    setApiStatus(false);


    setText(
      'dashboardMessage',
      'Gagal memuat dashboard: ' +
      error.message
    );


    throw error;

  }

}


/* =================================================
   LOAD KAMAR
   ================================================= */

async function loadKamar() {

  try {

    const result =
      await apiGet(
        'kamar'
      );


    console.log(
      'KAMAR:',
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : 'Gagal mengambil data kamar.'
      );

    }


    renderKamar(
      result.data || []
    );


    return result;

  } catch (error) {

    console.error(
      'Kamar error:',
      error
    );

    throw error;

  }

}


/* =================================================
   LOAD PENGHUNI
   ================================================= */

async function loadPenghuni() {

  try {

    const result =
      await apiGet(
        'penghuni'
      );


    console.log(
      'PENGHUNI:',
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : 'Gagal mengambil data penghuni.'
      );

    }


    renderPenghuni(
      result.data || []
    );


    return result;

  } catch (error) {

    console.error(
      'Penghuni error:',
      error
    );

    throw error;

  }

}


/* =================================================
   LOAD PEMBAYARAN
   ================================================= */

async function loadPembayaran() {

  try {

    const result =
      await apiGet(
        'pembayaran'
      );


    console.log(
      'PEMBAYARAN:',
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : 'Gagal mengambil data pembayaran.'
      );

    }


    renderPembayaran(
      result.data || []
    );


    return result;

  } catch (error) {

    console.error(
      'Pembayaran error:',
      error
    );

    throw error;

  }

}


/* =================================================
   SAVE KAMAR
   ================================================= */

async function saveKamar(event) {

  if (event) {
    event.preventDefault();
  }


  const data = {

    nomorKamar:
      getValue('nomorKamar'),

    lantai:
      getValue('lantai'),

    tipe:
      getValue('tipe'),

    harga:
      getValue('harga'),

    status:
      getValue('statusKamar') ||
      'KOSONG',

    fasilitas:
      getValue('fasilitas'),

    catatan:
      getValue('catatanKamar')

  };


  try {

    const result =
      await apiGet(
        'addKamar',
        data
      );


    console.log(
      'SAVE KAMAR:',
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : 'Gagal menyimpan kamar.'
      );

    }


    alert(
      result.message ||
      'Kamar berhasil disimpan.'
    );


    closeModal(
      'kamarModal'
    );


    resetForm(
      'kamarForm'
    );


    await loadKamar();

    await loadDashboard();

  } catch (error) {

    console.error(
      'Save kamar error:',
      error
    );


    alert(
      'Gagal menyimpan kamar: ' +
      error.message
    );

  }

}


/* =================================================
   SAVE PENGHUNI
   ================================================= */

async function savePenghuni(event) {

  if (event) {
    event.preventDefault();
  }


  const data = {

    nama:
      getValue('namaPenghuni'),

    nik:
      getValue('nik'),

    noHp:
      getValue('noHp'),

    email:
      getValue('email'),

    kamarId:
      getValue('kamarId'),

    tanggalMasuk:
      getValue('tanggalMasuk'),

    tanggalKeluar:
      getValue('tanggalKeluar'),

    status:
      getValue('statusPenghuni') ||
      'AKTIF',

    catatan:
      getValue('catatanPenghuni')

  };


  try {

    const result =
      await apiGet(
        'addPenghuni',
        data
      );


    console.log(
      'SAVE PENGHUNI:',
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : 'Gagal menyimpan penghuni.'
      );

    }


    alert(
      result.message ||
      'Penghuni berhasil disimpan.'
    );


    closeModal(
      'penghuniModal'
    );


    resetForm(
      'penghuniForm'
    );


    await loadPenghuni();

    await loadDashboard();

  } catch (error) {

    console.error(
      'Save penghuni error:',
      error
    );


    alert(
      'Gagal menyimpan penghuni: ' +
      error.message
    );

  }

}


/* =================================================
   SAVE PEMBAYARAN
   ================================================= */

async function savePembayaran(event) {

  if (event) {
    event.preventDefault();
  }


  const data = {

    penghuniId:
      getValue('penghuniId'),

    kontrakId:
      getValue('kontrakId'),

    periode:
      getValue('periode'),

    tanggalBayar:
      getValue('tanggalBayar'),

    jumlah:
      getValue('jumlah'),

    metode:
      getValue('metode'),

    status:
      getValue('statusPembayaran') ||
      'LUNAS',

    keterangan:
      getValue('keterangan'),

    buktiBayar:
      getValue('buktiBayar')

  };


  try {

    const result =
      await apiGet(
        'addPembayaran',
        data
      );


    console.log(
      'SAVE PEMBAYARAN:',
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : 'Gagal menyimpan pembayaran.'
      );

    }


    alert(
      result.message ||
      'Pembayaran berhasil disimpan.'
    );


    closeModal(
      'pembayaranModal'
    );


    resetForm(
      'pembayaranForm'
    );


    await loadPembayaran();

    await loadDashboard();

  } catch (error) {

    console.error(
      'Save pembayaran error:',
      error
    );


    alert(
      'Gagal menyimpan pembayaran: ' +
      error.message
    );

  }

}


/* =================================================
   SHOW PAGE
   ================================================= */

function showPage(pageName) {

  const pages =
    document.querySelectorAll(
      '.page'
    );


  pages.forEach(function(page) {

    page.style.display =
      'none';

    page.classList.remove(
      'active'
    );

  });


  const target =
    document.getElementById(
      pageName
    );


  if (target) {

    target.style.display =
      'block';

    target.classList.add(
      'active'
    );

  }


  const pageTitle =
    document.getElementById(
      'pageTitle'
    );


  const titles = {

    dashboard:
      'Dashboard',

    kamar:
      'Kamar',

    penghuni:
      'Penghuni',

    booking:
      'Booking',

    kontrak:
      'Kontrak',

    pembayaran:
      'Pembayaran',

    invoice:
      'Invoice'

  };


  if (pageTitle) {

    pageTitle.textContent =
      titles[pageName] ||
      'Kost Putri';

  }


  if (pageName === 'dashboard') {
    loadDashboard();
  }


  if (pageName === 'kamar') {
    loadKamar();
  }


  if (pageName === 'penghuni') {
    loadPenghuni();
  }


  if (pageName === 'pembayaran') {
    loadPembayaran();
  }

}


/* =================================================
   OPEN FORM
   ================================================= */

function openKamarForm() {

  const modal =
    document.getElementById(
      'kamarModal'
    );


  if (modal) {

    modal.style.display =
      'flex';

  }

}


function openPenghuniForm() {

  const modal =
    document.getElementById(
      'penghuniModal'
    );


  if (modal) {

    modal.style.display =
      'flex';

  }

}


function openPembayaranForm() {

  const modal =
    document.getElementById(
      'pembayaranModal'
    );


  if (modal) {

    modal.style.display =
      'flex';

  }

}


/* =================================================
   CLOSE MODAL
   ================================================= */

function closeModal(id) {

  const modal =
    document.getElementById(id);


  if (modal) {

    modal.style.display =
      'none';

  }

}


/* =================================================
   RENDER KAMAR
   ================================================= */

function renderKamar(data) {

  const table =
    document.getElementById(
      'kamarTable'
    );


  if (!table) {
    return;
  }


  let tbody;


  if (
    table.tagName &&
    table.tagName.toLowerCase() === 'tbody'
  ) {

    tbody = table;

  } else {

    tbody =
      table.querySelector('tbody');

  }


  if (!tbody) {
    return;
  }


  tbody.innerHTML = '';


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    tbody.innerHTML =
      '<tr>' +
      '<td colspan="20">' +
      'Belum ada data kamar.' +
      '</td>' +
      '</tr>';

    return;

  }


  data.forEach(function(row) {

    const tr =
      document.createElement('tr');


    tr.innerHTML =

      '<td>' +
      escapeHTML(row.KAMAR_ID) +
      '</td>' +

      '<td>' +
      escapeHTML(row.NOMOR_KAMAR) +
      '</td>' +

      '<td>' +
      escapeHTML(row.LANTAI) +
      '</td>' +

      '<td>' +
      escapeHTML(row.TIPE) +
      '</td>' +

      '<td>' +
      formatRupiah(row.HARGA) +
      '</td>' +

      '<td>' +
      escapeHTML(row.STATUS) +
      '</td>' +

      '<td>' +
      escapeHTML(row.FASILITAS) +
      '</td>';


    tbody.appendChild(tr);

  });

}


/* =================================================
   RENDER PENGHUNI
   ================================================= */

function renderPenghuni(data) {

  const table =
    document.getElementById(
      'penghuniTable'
    );


  if (!table) {
    return;
  }


  let tbody;


  if (
    table.tagName &&
    table.tagName.toLowerCase() === 'tbody'
  ) {

    tbody = table;

  } else {

    tbody =
      table.querySelector('tbody');

  }


  if (!tbody) {
    return;
  }


  tbody.innerHTML = '';


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    tbody.innerHTML =
      '<tr>' +
      '<td colspan="20">' +
      'Belum ada data penghuni.' +
      '</td>' +
      '</tr>';

    return;

  }


  data.forEach(function(row) {

    const tr =
      document.createElement('tr');


    tr.innerHTML =

      '<td>' +
      escapeHTML(row.PENGHUNI_ID) +
      '</td>' +

      '<td>' +
      escapeHTML(row.NAMA) +
      '</td>' +

      '<td>' +
      escapeHTML(row.NIK) +
      '</td>' +

      '<td>' +
      escapeHTML(row.NO_HP) +
      '</td>' +

      '<td>' +
      escapeHTML(row.EMAIL) +
      '</td>' +

      '<td>' +
      escapeHTML(row.KAMAR_ID) +
      '</td>' +

      '<td>' +
      formatDate(row.TANGGAL_MASUK) +
      '</td>' +

      '<td>' +
      formatDate(row.TANGGAL_KELUAR) +
      '</td>' +

      '<td>' +
      escapeHTML(row.STATUS) +
      '</td>' +

      '<td>' +
      escapeHTML(row.CATATAN) +
      '</td>';


    tbody.appendChild(tr);

  });

}


/* =================================================
   RENDER PEMBAYARAN
   ================================================= */

function renderPembayaran(data) {

  const table =
    document.getElementById(
      'pembayaranTable'
    );


  if (!table) {
    return;
  }


  let tbody;


  if (
    table.tagName &&
    table.tagName.toLowerCase() === 'tbody'
  ) {

    tbody = table;

  } else {

    tbody =
      table.querySelector('tbody');

  }


  if (!tbody) {
    return;
  }


  tbody.innerHTML = '';


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    tbody.innerHTML =
      '<tr>' +
      '<td colspan="20">' +
      'Belum ada data pembayaran.' +
      '</td>' +
      '</tr>';

    return;

  }


  data.forEach(function(row) {

    const tr =
      document.createElement('tr');


    tr.innerHTML =

      '<td>' +
      escapeHTML(row.PEMBAYARAN_ID) +
      '</td>' +

      '<td>' +
      escapeHTML(row.PENGHUNI_ID) +
      '</td>' +

      '<td>' +
      escapeHTML(row.KONTRAK_ID) +
      '</td>' +

      '<td>' +
      escapeHTML(row.PERIODE) +
      '</td>' +

      '<td>' +
      formatDate(row.TANGGAL_BAYAR) +
      '</td>' +

      '<td>' +
      formatRupiah(row.JUMLAH) +
      '</td>' +

      '<td>' +
      escapeHTML(row.METODE) +
      '</td>' +

      '<td>' +
      escapeHTML(row.STATUS) +
      '</td>' +

      '<td>' +
      escapeHTML(row.KETERANGAN) +
      '</td>';


    tbody.appendChild(tr);

  });

}


/* =================================================
   UTILITIES
   ================================================= */

function getValue(id) {

  const element =
    document.getElementById(id);


  if (!element) {
    return '';
  }


  return element.value || '';

}


function setText(id, value) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


function resetForm(id) {

  const form =
    document.getElementById(id);


  if (form) {

    form.reset();

  }

}


function formatRupiah(value) {

  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }
  ).format(
    Number(value) || 0
  );

}


function formatDate(value) {

  if (!value) {
    return '-';
  }


  const date =
    new Date(value);


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return escapeHTML(value);

  }


  return date.toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  );

}


function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return '';

  }


  return String(value)

    .replace(
      /&/g,
      '&amp;'
    )

    .replace(
      /</g,
      '&lt;'
    )

    .replace(
      />/g,
      '&gt;'
    )

    .replace(
      /"/g,
      '&quot;'
    )

    .replace(
      /'/g,
      '&#039;'
    );

}


/* =================================================
   API STATUS
   ================================================= */

function setApiStatus(connected) {

  const status =
    document.getElementById(
      'apiStatus'
    );


  if (!status) {
    return;
  }


  if (connected) {

    status.classList.add(
      'online'
    );

    status.title =
      'API Connected';

  } else {

    status.classList.remove(
      'online'
    );

    status.title =
      'API Disconnected';

  }

}


/* =================================================
   INITIALIZE AFTER LOGIN
   ================================================= */

async function initDashboardAfterLogin() {

  console.log(
    '================================='
  );

  console.log(
    'KOST PUTRI APP START'
  );

  console.log(
    'API:',
    API_URL
  );

  console.log(
    '================================='
  );


  try {

    const test =
      await testAPI();


    if (
      !test ||
      test.success !== true
    ) {

      throw new Error(
        test &&
        test.message
          ? test.message
          : 'API tidak aktif.'
      );

    }


    console.log(
      'API CONNECTED'
    );


    setApiStatus(true);


    await loadDashboard();

    await loadKamar();

    await loadPenghuni();

    await loadPembayaran();


    console.log(
      'DATA BERHASIL DIMUAT'
    );


  } catch (error) {

    console.error(
      'INIT ERROR:',
      error
    );


    setApiStatus(false);


    const loading =
      document.getElementById(
        'loading'
      );


    if (loading) {

      loading.textContent =
        'Gagal memuat data: ' +
        error.message;

    }

  }

}


/* =================================================
   INITIALIZATION
   ================================================= */

function initApp() {

  console.log(
    'KOST PUTRI APP INITIALIZING...'
  );


  if (isLoggedIn()) {

    showAppPage();

    updateUserDisplay();

    initDashboardAfterLogin();

  } else {

    showLoginPage();

  }

}


/* =================================================
   CLOSE MODAL WHEN CLICK OUTSIDE
   ================================================= */

document.addEventListener(
  'click',
  function(event) {

    if (
      event.target.classList &&
      event.target.classList.contains('modal')
    ) {

      event.target.style.display =
        'none';

    }

  }
);


/* =================================================
   DOM READY
   ================================================= */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    initApp();

  }
);


/* =================================================
   GLOBAL FUNCTIONS
   ================================================= */

window.apiGet =
  apiGet;

window.apiPost =
  apiPost;

window.testAPI =
  testAPI;

window.loginUser =
  loginUser;

window.logoutUser =
  logoutUser;

window.isLoggedIn =
  isLoggedIn;

window.loadDashboard =
  loadDashboard;

window.loadKamar =
  loadKamar;

window.loadPenghuni =
  loadPenghuni;

window.loadPembayaran =
  loadPembayaran;

window.saveKamar =
  saveKamar;

window.savePenghuni =
  savePenghuni;

window.savePembayaran =
  savePembayaran;

window.showPage =
  showPage;

window.openKamarForm =
  openKamarForm;

window.openPenghuniForm =
  openPenghuniForm;

window.openPembayaranForm =
  openPembayaranForm;

window.closeModal =
  closeModal;

window.updateUserDisplay =
  updateUserDisplay;
```
