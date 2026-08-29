```javascript
/*************************************************
 * KOST PUTRI MANAGEMENT SYSTEM
 * APP.JS
 * GITHUB PAGES -> GOOGLE APPS SCRIPT -> GOOGLE SHEETS
 *************************************************/


/* =================================================
   GOOGLE APPS SCRIPT API
   ================================================= */

const API_URL =
  'https://script.google.com/macros/s/AKfycbyQKGeA74rDh6jv1aQn2t0wAoIxmA2lhIlVY_ToR6gsX0sBWygwvLGMiXnMIO0OFjJWzw/exec';


/* =================================================
   JSONP REQUEST
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

    let completed = false;


    const timeout =
      setTimeout(function() {

        if (completed) {
          return;
        }

        completed = true;

        removeScript();

        reject(
          new Error(
            'Request timeout. API tidak merespons.'
          )
        );

      }, 20000);


    function removeScript() {

      clearTimeout(timeout);

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = null;
      }

    }


    window[callbackName] =
      function(response) {

        if (completed) {
          return;
        }

        completed = true;

        removeScript();

        resolve(response);

      };


    const query =
      new URLSearchParams();


    query.set(
      'action',
      action
    );


    query.set(
      'callback',
      callbackName
    );


    Object.keys(params).forEach(function(key) {

      const value =
        params[key];

      if (
        value !== undefined &&
        value !== null
      ) {

        query.set(
          key,
          value
        );

      }

    });


    script.src =
      API_URL +
      '?' +
      query.toString();


    script.async = true;


    script.onerror =
      function() {

        if (completed) {
          return;
        }

        completed = true;

        removeScript();

        reject(
          new Error(
            'Gagal menghubungi Google Apps Script.'
          )
        );

      };


    document.head.appendChild(
      script
    );

  });

}


/* =================================================
   TEST API
   ================================================= */

async function testAPI() {

  try {

    const result =
      await apiGet('test');


    console.log(
      'API TEST:',
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
          : 'API tidak aktif.'
      );

    }


    return result;


  } catch (error) {

    console.error(
      'TEST API ERROR:',
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


    setElementText(
      'totalKamar',
      data.totalKamar || 0
    );


    setElementText(
      'kamarTerisi',
      data.kamarTerisi || 0
    );


    setElementText(
      'kamarKosong',
      data.kamarKosong || 0
    );


    setElementText(
      'totalPenghuni',
      data.totalPenghuni || 0
    );


    setElementText(
      'bookingAktif',
      data.bookingAktif || 0
    );


    setElementText(
      'totalPendapatan',
      formatRupiah(
        data.totalPendapatan || 0
      )
    );


    return result;


  } catch (error) {

    console.error(
      'DASHBOARD ERROR:',
      error
    );

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
   TAMBAH KAMAR
   ================================================= */

async function addKamar(data) {

  if (
    !data ||
    !data.nomorKamar
  ) {

    alert(
      'Nomor kamar wajib diisi.'
    );

    return;

  }


  try {

    const result =
      await apiGet(
        'addKamar',
        data
      );


    console.log(
      'ADD KAMAR:',
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
      'Kamar berhasil ditambahkan.'
    );


    await loadKamar();

    await loadDashboard();


    return result;


  } catch (error) {

    console.error(
      'ADD KAMAR ERROR:',
      error
    );


    alert(
      'Gagal menyimpan kamar: ' +
      error.message
    );

  }

}


/* =================================================
   TAMBAH PENGHUNI
   ================================================= */

async function addPenghuni(data) {

  if (
    !data ||
    !data.nama
  ) {

    alert(
      'Nama penghuni wajib diisi.'
    );

    return;

  }


  try {

    const result =
      await apiGet(
        'addPenghuni',
        data
      );


    console.log(
      'ADD PENGHUNI:',
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
      'Penghuni berhasil ditambahkan.'
    );


    await loadPenghuni();

    await loadDashboard();


    return result;


  } catch (error) {

    console.error(
      'ADD PENGHUNI ERROR:',
      error
    );


    alert(
      'Gagal menyimpan penghuni: ' +
      error.message
    );

  }

}


/* =================================================
   TAMBAH PEMBAYARAN
   ================================================= */

async function addPembayaran(data) {

  try {

    const result =
      await apiGet(
        'addPembayaran',
        data
      );


    console.log(
      'ADD PEMBAYARAN:',
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


    await loadPembayaran();

    await loadDashboard();


    return result;


  } catch (error) {

    console.error(
      'ADD PEMBAYARAN ERROR:',
      error
    );


    alert(
      'Gagal menyimpan pembayaran: ' +
      error.message
    );

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


  const tbody =
    table.querySelector(
      'tbody'
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = '';


  if (
    !data ||
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
      '</td>' +

      '<td>' +
      escapeHTML(row.CATATAN) +
      '</td>';


    tbody.appendChild(
      tr
    );

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


  const tbody =
    table.querySelector(
      'tbody'
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = '';


  if (
    !data ||
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


    tbody.appendChild(
      tr
    );

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


  const tbody =
    table.querySelector(
      'tbody'
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = '';


  if (
    !data ||
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


    tbody.appendChild(
      tr
    );

  });

}


/* =================================================
   FORMAT RUPIAH
   ================================================= */

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


/* =================================================
   FORMAT DATE
   ================================================= */

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

    return escapeHTML(
      String(value)
    );

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


/* =================================================
   ESCAPE HTML
   ================================================= */

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
   SET TEXT
   ================================================= */

function setElementText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;

  }

}


/* =================================================
   INIT
   ================================================= */

async function initApp() {

  console.log(
    '================================='
  );

  console.log(
    'KOST PUTRI MANAGEMENT SYSTEM'
  );

  console.log(
    'APP START'
  );

  console.log(
    '================================='
  );


  try {

    await testAPI();


    console.log(
      'API CONNECTED'
    );


    await loadDashboard();

    await loadKamar();

    await loadPenghuni();

    await loadPembayaran();


    console.log(
      'SEMUA DATA BERHASIL DIMUAT'
    );


  } catch (error) {

    console.error(
      'INIT ERROR:',
      error
    );


    alert(
      'Gagal memuat data: ' +
      error.message
    );

  }

}


/* =================================================
   START APP
   ================================================= */

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    initApp
  );

} else {

  initApp();

}


/* =================================================
   GLOBAL FUNCTIONS
   ================================================= */

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

window.addKamar =
  addKamar;

window.addPenghuni =
  addPenghuni;

window.addPembayaran =
  addPembayaran;
```
