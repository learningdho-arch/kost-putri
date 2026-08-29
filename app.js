const API_URL =
'https://script.google.com/macros/s/AKfycbyQKGeA74rDh6jv1aQn2t0wAoIxmA2lhIlVY_ToR6gsX0sBWygwvLGMiXnMIO0OFjJWzw/exec';

console.log('KOST PUTRI APP V3 START');

/* =====================================================
LOGIN
===================================================== */

const LOGIN_USERNAME = 'admin';
const LOGIN_PASSWORD = 'admin123';

let isLoggedIn = false;

function loginUser(event) {

if (event) {
event.preventDefault();
}

const username =
document.getElementById('loginUsername');

const password =
document.getElementById('loginPassword');

const message =
document.getElementById('loginMessage');

if (!username || !password) {
return false;
}

if (
username.value.trim() === LOGIN_USERNAME &&
password.value === LOGIN_PASSWORD
) {

```
isLoggedIn = true;

localStorage.setItem(
  'kostPutriLoggedIn',
  'true'
);

if (message) {
  message.textContent = 'Login berhasil.';
}

showApplication();

showPage('dashboard');

return false;
```

}

if (message) {
message.textContent =
'Username atau password salah.';
}

return false;
}

function logoutUser() {

const yakin =
confirm('Yakin ingin logout?');

if (!yakin) {
return;
}

isLoggedIn = false;

localStorage.removeItem(
'kostPutriLoggedIn'
);

const loginPage =
document.getElementById('loginPage');

const appContainer =
document.getElementById('appContainer');

if (loginPage) {
loginPage.style.display = 'flex';
}

if (appContainer) {
appContainer.style.display = 'none';
}

}

/* =====================================================
LOGIN STATE
===================================================== */

function checkLogin() {

const status =
localStorage.getItem(
'kostPutriLoggedIn'
);

if (status === 'true') {

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

function showLogin() {

const loginPage =
document.getElementById('loginPage');

const appContainer =
document.getElementById('appContainer');

if (loginPage) {
loginPage.style.display = 'flex';
}

if (appContainer) {
appContainer.style.display = 'none';
}

}

function showApplication() {

const loginPage =
document.getElementById('loginPage');

const appContainer =
document.getElementById('appContainer');

if (loginPage) {
loginPage.style.display = 'none';
}

if (appContainer) {
appContainer.style.display = 'flex';
}

}

/* =====================================================
API JSONP
===================================================== */

function apiGet(action, params) {

params = params || {};

return new Promise(
function(resolve, reject) {

```
  const callbackName =
    'kostCallback_' +
    Date.now() +
    '_' +
    Math.floor(
      Math.random() * 100000
    );

  const script =
    document.createElement('script');

  let selesai = false;

  let timeout;


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
    } catch (e) {
      window[callbackName] = null;
    }

    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }

  }


  window[callbackName] =
    function(data) {

      if (selesai) {
        return;
      }

      selesai = true;

      cleanup();

      resolve(data);

    };


  script.onerror =
    function() {

      if (selesai) {
        return;
      }

      selesai = true;

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

        if (selesai) {
          return;
        }

        selesai = true;

        cleanup();

        reject(
          new Error(
            'API timeout. Google Apps Script tidak merespons.'
          )
        );

      },
      20000
    );

}
```

);

}

/* =====================================================
API TEST
===================================================== */

async function testAPI() {

const result =
await apiGet('test');

console.log(
'API TEST:',
result
);

return result;

}

/* =====================================================
API STATUS
===================================================== */

function setAPIStatus(status) {

const element =
document.getElementById(
'apiStatus'
);

if (!element) {
return;
}

if (status) {

```
element.classList.add(
  'online'
);

element.classList.remove(
  'offline'
);

element.title =
  'API Connected';
```

} else {

```
element.classList.add(
  'offline'
);

element.classList.remove(
  'online'
);

element.title =
  'API Offline';
```

}

}

/* =====================================================
DASHBOARD
===================================================== */

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
  'Data berhasil diperbarui.'
);

setAPIStatus(true);

return result;
```

} catch (error) {

```
console.error(
  'Dashboard ERROR:',
  error
);

setAPIStatus(false);

setText(
  'dashboardMessage',
  'Gagal memuat data.'
);

throw error;
```

}

}

/* =====================================================
LOAD KAMAR
===================================================== */

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

```
throw new Error(
  result && result.message
    ? result.message
    : 'Gagal mengambil data kamar.'
);
```

}

renderKamar(
Array.isArray(result.data)
? result.data
: []
);

return result;

}

/* =====================================================
LOAD PENGHUNI
===================================================== */

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

```
throw new Error(
  result && result.message
    ? result.message
    : 'Gagal mengambil data penghuni.'
);
```

}

renderPenghuni(
Array.isArray(result.data)
? result.data
: []
);

return result;

}

/* =====================================================
LOAD PEMBAYARAN
===================================================== */

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

```
throw new Error(
  result && result.message
    ? result.message
    : 'Gagal mengambil data pembayaran.'
);
```

}

renderPembayaran(
Array.isArray(result.data)
? result.data
: []
);

return result;

}

/* =====================================================
SAVE KAMAR
===================================================== */

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
```

} catch (error) {

```
console.error(
  'SAVE KAMAR ERROR:',
  error
);

alert(
  'Gagal menyimpan kamar: ' +
  error.message
);
```

}

}

/* =====================================================
SAVE PENGHUNI
===================================================== */

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
```

} catch (error) {

```
console.error(
  'SAVE PENGHUNI ERROR:',
  error
);

alert(
  'Gagal menyimpan penghuni: ' +
  error.message
);
```

}

}

/* =====================================================
SAVE PEMBAYARAN
===================================================== */

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
```

} catch (error) {

```
console.error(
  'SAVE PEMBAYARAN ERROR:',
  error
);

alert(
  'Gagal menyimpan pembayaran: ' +
  error.message
);
```

}

}

/* =====================================================
NAVIGASI
===================================================== */

function showPage(pageName) {

if (!isLoggedIn) {
showLogin();
return;
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
document.getElementById(
pageName
);

if (!target) {
return;
}

target.style.display =
'block';

target.classList.add(
'active'
);

const titles = {

```
dashboard: 'Dashboard',
kamar: 'Kamar',
penghuni: 'Penghuni',
booking: 'Booking',
kontrak: 'Kontrak',
pembayaran: 'Pembayaran',
invoice: 'Invoice'
```

};

const pageTitle =
document.getElementById(
'pageTitle'
);

if (pageTitle) {

```
pageTitle.textContent =
  titles[pageName] ||
  'Kost Putri';
```

}

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

/* =====================================================
MODAL
===================================================== */

function openModal(id) {

const modal =
document.getElementById(id);

if (!modal) {
return;
}

modal.style.display =
'flex';

}

function closeModal(id) {

const modal =
document.getElementById(id);

if (!modal) {
return;
}

modal.style.display =
'none';

}

function openKamarForm() {

openModal(
'kamarModal'
);

}

function openPenghuniForm() {

openModal(
'penghuniModal'
);

}

function openPembayaranForm() {

openModal(
'pembayaranModal'
);

}

/* =====================================================
RENDER KAMAR
===================================================== */

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
!data ||
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

/* =====================================================
RENDER PENGHUNI
===================================================== */

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
!data ||
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

/* =====================================================
RENDER PEMBAYARAN
===================================================== */

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
!data ||
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

/* =====================================================
UTILITIES
===================================================== */

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

if (!element) {
return;
}

element.textContent =
value;

}

function resetForm(id) {

const form =
document.getElementById(id);

if (form) {
form.reset();
}

}

function formatRupiah(value) {

const number =
Number(value) || 0;

return new Intl.NumberFormat(
'id-ID',
{
style: 'currency',
currency: 'IDR',
maximumFractionDigits: 0
}
).format(number);

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

/* =====================================================
INITIALIZATION
===================================================== */

async function initApp() {

console.log(
'DOM READY - APP V3'
);

checkLogin();

const loginForm =
document.getElementById(
'loginForm'
);

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
```

}

}

/* =====================================================
GLOBAL FUNCTION
===================================================== */

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

/* =====================================================
START
===================================================== */

document.addEventListener(
'DOMContentLoaded',
function() {

```
initApp();
```

}
);
