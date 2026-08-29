/* =========================================================
KOST PUTRI MANAGEMENT SYSTEM
APP.JS FINAL
GitHub Pages -> Google Apps Script -> Google Sheets
========================================================= */

/* =========================================================
KONFIGURASI API
========================================================= */

const API_URL =
'https://script.google.com/macros/s/AKfycbyQKGeA74rDh6jv1aQn2t0wAoIxmA2lhIlVY_ToR6gsX0sBWygwvLGMiXnMIO0OFjJWzw/exec';

/* =========================================================
LOGIN
========================================================= */

const LOGIN_USERNAME = 'admin';
const LOGIN_PASSWORD = 'admin123';

let isLoggedIn = false;

/* =========================================================
HELPER ELEMENT
========================================================= */

function getElement(id) {
return document.getElementById(id);
}

/* =========================================================
LOGIN CHECK
========================================================= */

function checkLogin() {

const loginStatus =
localStorage.getItem('kostPutriLoggedIn');

if (loginStatus === 'true') {

```
isLoggedIn = true;

showApplication();
```

} else {

```
isLoggedIn = false;

showLogin();
```

}

}

/* =========================================================
SHOW LOGIN
========================================================= */

function showLogin() {

const loginPage =
getElement('loginPage');

const appContainer =
getElement('appContainer');

if (loginPage) {
loginPage.style.display = 'flex';
}

if (appContainer) {
appContainer.style.display = 'none';
}

}

/* =========================================================
SHOW APPLICATION
========================================================= */

function showApplication() {

const loginPage =
getElement('loginPage');

const appContainer =
getElement('appContainer');

if (loginPage) {
loginPage.style.display = 'none';
}

if (appContainer) {
appContainer.style.display = 'flex';
}

}

/* =========================================================
LOGIN USER
========================================================= */

function loginUser(event) {

if (event) {
event.preventDefault();
}

const usernameElement =
getElement('loginUsername');

const passwordElement =
getElement('loginPassword');

const messageElement =
getElement('loginMessage');

const username =
usernameElement
? usernameElement.value.trim()
: '';

const password =
passwordElement
? passwordElement.value
: '';

if (
username === LOGIN_USERNAME &&
password === LOGIN_PASSWORD
) {

```
isLoggedIn = true;

localStorage.setItem(
  'kostPutriLoggedIn',
  'true'
);

if (messageElement) {
  messageElement.textContent =
    'Login berhasil.';
}

showApplication();

showPage('dashboard');

return false;
```

}

if (messageElement) {

```
messageElement.textContent =
  'Username atau password salah.';
```

}

return false;

}

/* =========================================================
LOGOUT
========================================================= */

function logoutUser() {

const confirmLogout =
window.confirm(
'Apakah kamu yakin ingin logout?'
);

if (!confirmLogout) {
return;
}

isLoggedIn = false;

localStorage.removeItem(
'kostPutriLoggedIn'
);

showLogin();

const loginForm =
getElement('loginForm');

if (loginForm) {
loginForm.reset();
}

const loginMessage =
getElement('loginMessage');

if (loginMessage) {
loginMessage.textContent = '';
}

}

/* =========================================================
API GET - JSONP
========================================================= */

function apiGet(action, params) {

params = params || {};

return new Promise(function(resolve, reject) {

```
const callbackName =
  'kostPutriCallback_' +
  Date.now() +
  '_' +
  Math.floor(
    Math.random() * 100000
  );


const script =
  document.createElement('script');


let finished = false;

let timeout = null;


const query =
  new URLSearchParams();


query.append(
  'action',
  action || ''
);


query.append(
  'callback',
  callbackName
);


Object.keys(params).forEach(
  function(key) {

    const value =
      params[key];

    if (
      value !== undefined &&
      value !== null
    ) {

      query.append(
        key,
        String(value)
      );

    }

  }
);


function cleanup() {

  if (timeout) {
    clearTimeout(timeout);
  }

  try {
    delete window[callbackName];
  } catch (error) {
    window[callbackName] = undefined;
  }

  if (script.parentNode) {
    script.parentNode.removeChild(script);
  }

}


window[callbackName] =
  function(data) {

    if (finished) {
      return;
    }

    finished = true;

    cleanup();

    resolve(data);

  };


script.onerror =
  function() {

    if (finished) {
      return;
    }

    finished = true;

    cleanup();

    reject(
      new Error(
        'Gagal menghubungkan ke Google Apps Script.'
      )
    );

  };


script.src =
  API_URL +
  '?' +
  query.toString();


script.async = true;


document.head.appendChild(
  script
);


timeout =
  setTimeout(
    function() {

      if (finished) {
        return;
      }

      finished = true;

      cleanup();

      reject(
        new Error(
          'API timeout. Google Apps Script tidak merespons.'
        )
      );

    },
    20000
  );
```

});

}

/* =========================================================
TEST API
========================================================= */

async function testAPI() {

try {

```
const result =
  await apiGet('test');

console.log(
  'API TEST:',
  result
);

return result;
```

} catch (error) {

```
console.error(
  'API TEST ERROR:',
  error
);

throw error;
```

}

}

/* =========================================================
UPDATE API STATUS
========================================================= */

function setAPIStatus(connected) {

const status =
getElement('apiStatus');

if (!status) {
return;
}

if (connected) {

```
status.classList.add(
  'online'
);

status.classList.remove(
  'offline'
);

status.title =
  'API Connected';
```

} else {

```
status.classList.add(
  'offline'
);

status.classList.remove(
  'online'
);

status.title =
  'API Offline';
```

}

}

/* =========================================================
DASHBOARD
========================================================= */

async function loadDashboard() {

try {

```
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
    result && result.message
      ? result.message
      : 'Gagal mengambil data dashboard.'
  );

}


const data =
  result.data || {};


setText(
  'totalKamar',
  data.totalKamar || 0
);


setText(
  'kamarKosong',
  data.kamarKosong || 0
);


setText(
  'kamarTerisi',
  data.kamarTerisi || 0
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


setAPIStatus(true);


return result;
```

} catch (error) {

```
console.error(
  'Dashboard error:',
  error
);


setAPIStatus(false);


setText(
  'dashboardMessage',
  'Gagal memuat dashboard: ' +
  error.message
);


throw error;
```

}

}

/* =========================================================
LOAD KAMAR
========================================================= */

async function loadKamar() {

try {

```
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
    result && result.message
      ? result.message
      : 'Gagal mengambil data kamar.'
  );

}


renderKamar(
  Array.isArray(result.data)
    ? result.data
    : []
);


setAPIStatus(true);


return result;
```

} catch (error) {

```
console.error(
  'Kamar error:',
  error
);

setAPIStatus(false);

throw error;
```

}

}

/* =========================================================
LOAD PENGHUNI
========================================================= */

async function loadPenghuni() {

try {

```
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
    result && result.message
      ? result.message
      : 'Gagal mengambil data penghuni.'
  );

}


renderPenghuni(
  Array.isArray(result.data)
    ? result.data
    : []
);


setAPIStatus(true);


return result;
```

} catch (error) {

```
console.error(
  'Penghuni error:',
  error
);

setAPIStatus(false);

throw error;
```

}

}

/* =========================================================
LOAD PEMBAYARAN
========================================================= */

async function loadPembayaran() {

try {

```
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
    result && result.message
      ? result.message
      : 'Gagal mengambil data pembayaran.'
  );

}


renderPembayaran(
  Array.isArray(result.data)
    ? result.data
    : []
);


setAPIStatus(true);


return result;
```

} catch (error) {

```
console.error(
  'Pembayaran error:',
  error
);

setAPIStatus(false);

throw error;
```

}

}

/* =========================================================
SAVE KAMAR
========================================================= */

async function saveKamar(event) {

if (event) {
event.preventDefault();
}

const data = {

```
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
```

};

if (!data.nomorKamar) {

```
alert(
  'Nomor kamar wajib diisi.'
);

return false;
```

}

if (!data.lantai) {

```
alert(
  'Lantai wajib diisi.'
);

return false;
```

}

if (!data.tipe) {

```
alert(
  'Tipe kamar wajib diisi.'
);

return false;
```

}

if (!data.harga) {

```
alert(
  'Harga kamar wajib diisi.'
);

return false;
```

}

try {

```
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
    result && result.message
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


return result;
```

} catch (error) {

```
console.error(
  'Save kamar error:',
  error
);


alert(
  'Gagal menyimpan kamar: ' +
  error.message
);


return false;
```

}

}

/* =========================================================
SAVE PENGHUNI
========================================================= */

async function savePenghuni(event) {

if (event) {
event.preventDefault();
}

const data = {

```
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

status:
  'AKTIF',

catatan:
  getValue('catatanPenghuni')
```

};

if (!data.nama) {

```
alert(
  'Nama penghuni wajib diisi.'
);

return false;
```

}

if (!data.noHp) {

```
alert(
  'Nomor HP wajib diisi.'
);

return false;
```

}

if (!data.tanggalMasuk) {

```
alert(
  'Tanggal masuk wajib diisi.'
);

return false;
```

}

try {

```
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
    result && result.message
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


return result;
```

} catch (error) {

```
console.error(
  'Save penghuni error:',
  error
);


alert(
  'Gagal menyimpan penghuni: ' +
  error.message
);


return false;
```

}

}

/* =========================================================
SAVE PEMBAYARAN
========================================================= */

async function savePembayaran(event) {

if (event) {
event.preventDefault();
}

const data = {

```
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
```

};

if (!data.penghuniId) {

```
alert(
  'Penghuni ID wajib diisi.'
);

return false;
```

}

if (!data.jumlah) {

```
alert(
  'Jumlah pembayaran wajib diisi.'
);

return false;
```

}

try {

```
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
    result && result.message
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


return result;
```

} catch (error) {

```
console.error(
  'Save pembayaran error:',
  error
);


alert(
  'Gagal menyimpan pembayaran: ' +
  error.message
);


return false;
```

}

}

/* =========================================================
SHOW PAGE
========================================================= */

function showPage(pageName) {

if (!isLoggedIn) {

```
showLogin();

return;
```

}

const pages =
document.querySelectorAll(
'.page'
);

pages.forEach(
function(page) {

```
  page.style.display =
    'none';

  page.classList.remove(
    'active'
  );

}
```

);

const target =
getElement(pageName);

if (!target) {

```
console.warn(
  'Page tidak ditemukan:',
  pageName
);

return;
```

}

target.style.display =
'block';

target.classList.add(
'active'
);

updatePageTitle(
pageName
);

if (pageName === 'dashboard') {

```
loadDashboard()
  .catch(function(error) {

    console.error(error);

  });
```

}

if (pageName === 'kamar') {

```
loadKamar()
  .catch(function(error) {

    console.error(error);

  });
```

}

if (pageName === 'penghuni') {

```
loadPenghuni()
  .catch(function(error) {

    console.error(error);

  });
```

}

if (pageName === 'pembayaran') {

```
loadPembayaran()
  .catch(function(error) {

    console.error(error);

  });
```

}

}

/* =========================================================
PAGE TITLE
========================================================= */

function updatePageTitle(pageName) {

const title =
getElement('pageTitle');

if (!title) {
return;
}

const titles = {

```
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
```

};

title.textContent =
titles[pageName] ||
'Kost Putri';

}

/* =========================================================
OPEN KAMAR FORM
========================================================= */

function openKamarForm() {

openModal(
'kamarModal'
);

}

/* =========================================================
OPEN PENGHUNI FORM
========================================================= */

function openPenghuniForm() {

openModal(
'penghuniModal'
);

}

/* =========================================================
OPEN PEMBAYARAN FORM
========================================================= */

function openPembayaranForm() {

openModal(
'pembayaranModal'
);

}

/* =========================================================
OPEN MODAL
========================================================= */

function openModal(id) {

const modal =
getElement(id);

if (!modal) {

```
console.warn(
  'Modal tidak ditemukan:',
  id
);

return;
```

}

modal.style.display =
'flex';

modal.classList.add(
'active'
);

}

/* =========================================================
CLOSE MODAL
========================================================= */

function closeModal(id) {

const modal =
getElement(id);

if (!modal) {
return;
}

modal.style.display =
'none';

modal.classList.remove(
'active'
);

}

/* =========================================================
RENDER KAMAR
========================================================= */

function renderKamar(data) {

const tbody =
getElement('kamarTable');

if (!tbody) {
return;
}

tbody.innerHTML =
'';

if (
!Array.isArray(data) ||
data.length === 0
) {

```
tbody.innerHTML =
  '<tr>' +
  '<td colspan="7">' +
  'Belum ada data kamar.' +
  '</td>' +
  '</tr>';

return;
```

}

data.forEach(
function(row) {

```
  const tr =
    document.createElement(
      'tr'
    );


  tr.innerHTML =

    '<td>' +
    escapeHTML(
      row.KAMAR_ID
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.NOMOR_KAMAR
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.LANTAI
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.TIPE
    ) +
    '</td>' +

    '<td>' +
    formatRupiah(
      row.HARGA
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.STATUS
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.FASILITAS
    ) +
    '</td>';


  tbody.appendChild(
    tr
  );

}
```

);

}

/* =========================================================
RENDER PENGHUNI
========================================================= */

function renderPenghuni(data) {

const tbody =
getElement('penghuniTable');

if (!tbody) {
return;
}

tbody.innerHTML =
'';

if (
!Array.isArray(data) ||
data.length === 0
) {

```
tbody.innerHTML =
  '<tr>' +
  '<td colspan="6">' +
  'Belum ada data penghuni.' +
  '</td>' +
  '</tr>';

return;
```

}

data.forEach(
function(row) {

```
  const tr =
    document.createElement(
      'tr'
    );


  tr.innerHTML =

    '<td>' +
    escapeHTML(
      row.PENGHUNI_ID
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.NAMA
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.NO_HP
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.KAMAR_ID
    ) +
    '</td>' +

    '<td>' +
    formatDate(
      row.TANGGAL_MASUK
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.STATUS
    ) +
    '</td>';


  tbody.appendChild(
    tr
  );

}
```

);

}

/* =========================================================
RENDER PEMBAYARAN
========================================================= */

function renderPembayaran(data) {

const tbody =
getElement(
'pembayaranTable'
);

if (!tbody) {
return;
}

tbody.innerHTML =
'';

if (
!Array.isArray(data) ||
data.length === 0
) {

```
tbody.innerHTML =
  '<tr>' +
  '<td colspan="9">' +
  'Belum ada data pembayaran.' +
  '</td>' +
  '</tr>';

return;
```

}

data.forEach(
function(row) {

```
  const tr =
    document.createElement(
      'tr'
    );


  tr.innerHTML =

    '<td>' +
    escapeHTML(
      row.PEMBAYARAN_ID
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.PENGHUNI_ID
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.KONTRAK_ID
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.PERIODE
    ) +
    '</td>' +

    '<td>' +
    formatDate(
      row.TANGGAL_BAYAR
    ) +
    '</td>' +

    '<td>' +
    formatRupiah(
      row.JUMLAH
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.METODE
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.STATUS
    ) +
    '</td>' +

    '<td>' +
    escapeHTML(
      row.KETERANGAN
    ) +
    '</td>';


  tbody.appendChild(
    tr
  );

}
```

);

}

/* =========================================================
GET VALUE
========================================================= */

function getValue(id) {

const element =
getElement(id);

if (!element) {
return '';
}

return element.value || '';

}

/* =========================================================
SET TEXT
========================================================= */

function setText(id, value) {

const element =
getElement(id);

if (!element) {
return;
}

element.textContent =
value === undefined ||
value === null
? ''
: value;

}

/* =========================================================
RESET FORM
========================================================= */

function resetForm(id) {

const form =
getElement(id);

if (form) {
form.reset();
}

}

/* =========================================================
FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {

let number =
Number(value);

if (isNaN(number)) {
number = 0;
}

return new Intl.NumberFormat(
'id-ID',
{
style: 'currency',
currency: 'IDR',
maximumFractionDigits: 0
}
).format(number);

}

/* =========================================================
FORMAT DATE
========================================================= */

function formatDate(value) {

if (
value === undefined ||
value === null ||
value === ''
) {

```
return '-';
```

}

const date =
new Date(value);

if (
isNaN(
date.getTime()
)
) {

```
return escapeHTML(
  value
);
```

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

/* =========================================================
ESCAPE HTML
========================================================= */

function escapeHTML(value) {

if (
value === undefined ||
value === null
) {

```
return '';
```

}

return String(value)

```
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
```

}

/* =========================================================
INITIALIZATION
========================================================= */

async function initApp() {

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

checkLogin();

const loginForm =
getElement('loginForm');

if (loginForm) {

```
loginForm.addEventListener(
  'submit',
  loginUser
);
```

}

if (!isLoggedIn) {

```
console.log(
  'USER BELUM LOGIN'
);

return;
```

}

try {

```
const test =
  await testAPI();


if (
  !test ||
  test.success !== true
) {

  throw new Error(
    test && test.message
      ? test.message
      : 'API tidak aktif.'
  );

}


console.log(
  'API CONNECTED'
);


setAPIStatus(
  true
);


await loadDashboard();

await loadKamar();

await loadPenghuni();

await loadPembayaran();


console.log(
  'DATA BERHASIL DIMUAT'
);
```

} catch (error) {

```
console.error(
  'INIT ERROR:',
  error
);


setAPIStatus(
  false
);


const loading =
  getElement('loading');


if (loading) {

  loading.style.display =
    'block';

  loading.textContent =
    'Gagal memuat data: ' +
    error.message;

}
```

}

}

/* =========================================================
MODAL CLICK OUTSIDE
========================================================= */

function setupModalEvents() {

const modalIds = [

```
'kamarModal',
'penghuniModal',
'pembayaranModal'
```

];

modalIds.forEach(
function(id) {

```
  const modal =
    getElement(id);


  if (!modal) {
    return;
  }


  modal.addEventListener(
    'click',
    function(event) {

      if (
        event.target === modal
      ) {

        closeModal(id);

      }

    }
  );

}
```

);

}

/* =========================================================
ESCAPE KEY
========================================================= */

function setupEscapeKey() {

document.addEventListener(
'keydown',
function(event) {

```
  if (
    event.key === 'Escape'
  ) {

    closeModal(
      'kamarModal'
    );

    closeModal(
      'penghuniModal'
    );

    closeModal(
      'pembayaranModal'
    );

  }

}
```

);

}

/* =========================================================
START APP
========================================================= */

document.addEventListener(
'DOMContentLoaded',
function() {

```
console.log(
  'DOM READY - APP JS BERHASIL'
);


setupModalEvents();

setupEscapeKey();

initApp();
```

}
);

/* =========================================================
GLOBAL FUNCTIONS
Supaya onclick="" di HTML dapat memanggil fungsi
========================================================= */

window.loginUser =
loginUser;

window.logoutUser =
logoutUser;

window.apiGet =
apiGet;

window.testAPI =
testAPI;

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

window.openModal =
openModal;

window.closeModal =
closeModal;

window.formatRupiah =
formatRupiah;

window.formatDate =
formatDate;

/* =========================================================
END
========================================================= */
