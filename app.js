```javascript
/*************************************************
 * KOST PUTRI MANAGEMENT SYSTEM
 * APP.JS FINAL
 * GitHub Pages → Apps Script → Google Sheets
 *************************************************/


/* =================================================
   CONFIG
   ================================================= */

const API_URL =
  'https://script.google.com/macros/s/AKfycbyQKGeA74rDh6jv1aQn2t0wAoIxmA2lhIlVY_ToR6gsX0sBWygwvLGMiXnMIO0OFjJWzw/exec';

const LOGIN_KEY = 'kost_putri_login';
const USER_KEY = 'kost_putri_user';


/* =================================================
   API GET - JSONP
   ================================================= */

function apiGet(action, params = {}) {

  return new Promise(function(resolve, reject) {

    const callbackName =
      'kostCallback_' +
      Date.now() +
      '_' +
      Math.floor(Math.random() * 100000);

    const script =
      document.createElement('script');

    let finished = false;

    let timeout;

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

      if (
        params[key] !== undefined &&
        params[key] !== null
      ) {

        query.append(
          key,
          params[key]
        );

      }

    });


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

async function apiPost(data = {}) {

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
   LOGIN
   ================================================= */

function isLoggedIn() {

  return (
    localStorage.getItem(LOGIN_KEY) === 'true'
  );

}


function getCurrentUser() {

  return (
    localStorage.getItem(USER_KEY) ||
    ''
  );

}


function loginUser(event) {

  if (event) {
    event.preventDefault();
  }


  const username =
    getValue('loginUsername').trim();

  const password =
    getValue('loginPassword');


  const error =
    document.getElementById(
      'loginError'
    );


  /*
   * LOGIN DEFAULT
   *
   * Username : admin
   * Password : admin123
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


    if (error) {

      error.textContent =
        '';

    }


    showApp();

    initAppData();

    return;

  }


  if (error) {

    error.textContent =
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


  location.reload();

}


function showLogin() {

  const loginPage =
    document.getElementById(
      'loginPage'
    );

  const appContainer =
    document.getElementById(
      'appContainer'
    );


  if (loginPage) {

    loginPage.style.display =
      'flex';

  }


  if (appContainer) {

    appContainer.style.display =
      'none';

  }

}


function showApp() {

  const loginPage =
    document.getElementById(
      'loginPage'
    );

  const appContainer =
    document.getElementById(
      'appContainer'
    );


  if (loginPage) {

    loginPage.style.display =
      'none';

  }


  if (appContainer) {

    appContainer.style.display =
      'block';

  }

}


/* =================================================
   API TEST
   ================================================= */

async function testAPI() {

  try {

    const result =
      await apiGet('test');


    console.log(
      'API TEST:',
      result
    );


    return result;

  } catch (error) {

    console.error(
      'API TEST ERROR:',
      error
    );

    throw error;

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
      'Data berhasil dimuat.'
    );


    setApiStatus(true);


    return result;

  } catch (error) {

    console.error(
      'Dashboard error:',
      error
    );


    setApiStatus(false);

    throw error;

  }

}


/* =================================================
   LOAD KAMAR
   ================================================= */

async function loadKamar() {

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

}


/* =================================================
   LOAD PENGHUNI
   ================================================= */

async function loadPenghuni() {

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

}


/* =================================================
   LOAD PEMBAYARAN
   ================================================= */

async function loadPembayaran() {

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


    const form =
      document.getElementById(
        'kamarForm'
      );

    if (form) {
      form.reset();
    }


    await loadKamar();

    await loadDashboard();


  } catch (error) {

    console.error(
      'SAVE KAMAR ERROR:',
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


    const form =
      document.getElementById(
        'penghuniForm'
      );

    if (form) {
      form.reset();
    }


    await loadPenghuni();

    await loadDashboard();


  } catch (error) {

    console.error(
      'SAVE PENGHUNI ERROR:',
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


    const form =
      document.getElementById(
        'pembayaranForm'
      );

    if (form) {
      form.reset();
    }


    await loadPembayaran();

    await loadDashboard();


  } catch (error) {

    console.error(
      'SAVE PEMBAYARAN ERROR:',
      error
    );


    alert(
      'Gagal menyimpan pembayaran: ' +
      error.message
    );

  }

}


/* =================================================
   PAGE NAVIGATION
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


  setText(
    'pageTitle',
    titles[pageName] ||
    'Kost Putri'
  );


  if (
    pageName === 'dashboard'
  ) {

    loadDashboard();

  }


  if (
    pageName === 'kamar'
  ) {

    loadKamar();

  }


  if (
    pageName === 'penghuni'
  ) {

    loadPenghuni();

  }


  if (
    pageName === 'pembayaran'
  ) {

    loadPembayaran();

  }

}


/* =================================================
   MODAL
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

  const tbody =
    document.getElementById(
      'kamarTable'
    );


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
      document.createElement(
        'tr'
      );


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

  const tbody =
    document.getElementById(
      'penghuniTable'
    );


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
      document.createElement(
        'tr'
      );


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

  const tbody =
    document.getElementById(
      'pembayaranTable'
    );


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
      document.createElement(
        'tr'
      );


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

  const element =
    document.getElementById(
      'apiStatus'
    );


  if (!element) {
    return;
  }


  if (connected) {

    element.classList.add(
      'online'
    );

    element.title =
      'API Connected';

  } else {

    element.classList.remove(
      'online'
    );

    element.title =
      'API Disconnected';

  }

}


/* =================================================
   INITIALIZE DATA
   ================================================= */

async function initAppData() {

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


    const message =
      document.getElementById(
        'dashboardMessage'
      );


    if (message) {

      message.textContent =
        'Gagal memuat data: ' +
        error.message;

    }

  }

}


/* =================================================
   START APPLICATION
   ================================================= */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    if (isLoggedIn()) {

      showApp();

      initAppData();

    } else {

      showLogin();

    }

  }
);


/* =================================================
   CLOSE MODAL WHEN CLICK OUTSIDE
   ================================================= */

window.addEventListener(
  'click',
  function(event) {

    if (
      event.target &&
      event.target.classList &&
      event.target.classList.contains('modal')
    ) {

      event.target.style.display =
        'none';

    }

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

window.loginUser =
  loginUser;

window.logoutUser =
  logoutUser;
```
