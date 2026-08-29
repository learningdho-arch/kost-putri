```javascript
/* =========================================================
   KOST PUTRI MANAGEMENT SYSTEM
   APP.JS - CLEAN VERSION
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyQKGeA74rDh6jv1aQn2t0wAoIxmA2lhIlVY_ToR6gsX0sBWygwvLGMiXnMIO0OFjJWzw/exec";


/* =========================================================
   APP START
   ========================================================= */

console.log("APP JS TEST - FINAL");


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  console.log("DOM READY - APP JS BERHASIL");

  setupLogin();
  setupInitialPage();

});


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

  var loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    console.warn("loginForm tidak ditemukan");
    return;
  }

  loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    loginUser();

  });

}


/* =========================================================
   LOGIN USER
   ========================================================= */

function loginUser() {

  var usernameElement =
    document.getElementById("loginUsername");

  var passwordElement =
    document.getElementById("loginPassword");

  var messageElement =
    document.getElementById("loginMessage");

  if (!usernameElement || !passwordElement) {
    return;
  }

  var username =
    usernameElement.value.trim();

  var password =
    passwordElement.value;

  /*
   * LOGIN SEMENTARA
   *
   * Username : admin
   * Password : admin123
   *
   * Nanti bisa kita pindahkan ke Google Sheets.
   */

  if (
    username === "admin" &&
    password === "admin123"
  ) {

    if (messageElement) {
      messageElement.textContent =
        "Login berhasil.";
    }

    localStorage.setItem(
      "kostPutriLogin",
      "true"
    );

    showApplication();

    return;
  }

  if (messageElement) {

    messageElement.textContent =
      "Username atau password salah.";

  }

}


/* =========================================================
   SHOW APPLICATION
   ========================================================= */

function showApplication() {

  var loginPage =
    document.getElementById("loginPage");

  var appContainer =
    document.getElementById("appContainer");

  if (loginPage) {
    loginPage.style.display = "none";
  }

  if (appContainer) {
    appContainer.style.display = "flex";
  }

  showPage("dashboard");

}


/* =========================================================
   INITIAL PAGE
   ========================================================= */

function setupInitialPage() {

  var loginPage =
    document.getElementById("loginPage");

  var appContainer =
    document.getElementById("appContainer");

  var loggedIn =
    localStorage.getItem("kostPutriLogin");

  if (loggedIn === "true") {

    if (loginPage) {
      loginPage.style.display = "none";
    }

    if (appContainer) {
      appContainer.style.display = "flex";
    }

    showPage("dashboard");

  } else {

    if (loginPage) {
      loginPage.style.display = "block";
    }

    if (appContainer) {
      appContainer.style.display = "none";
    }

  }

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

  localStorage.removeItem(
    "kostPutriLogin"
  );

  var loginPage =
    document.getElementById("loginPage");

  var appContainer =
    document.getElementById("appContainer");

  if (appContainer) {
    appContainer.style.display = "none";
  }

  if (loginPage) {
    loginPage.style.display = "block";
  }

  var username =
    document.getElementById("loginUsername");

  var password =
    document.getElementById("loginPassword");

  var message =
    document.getElementById("loginMessage");

  if (username) {
    username.value = "";
  }

  if (password) {
    password.value = "";
  }

  if (message) {
    message.textContent = "";
  }

}


/* =========================================================
   API GET - JSONP
   ========================================================= */

function apiGet(action, params) {

  params = params || {};

  return new Promise(function (resolve, reject) {

    var callbackName =
      "callback_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 100000);

    var script =
      document.createElement("script");

    var finished = false;

    var query =
      new URLSearchParams();

    query.append(
      "action",
      action
    );

    query.append(
      "callback",
      callbackName
    );

    Object.keys(params).forEach(function (key) {

      var value = params[key];

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

    var timeout =
      setTimeout(function () {

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
            "API timeout. Google Apps Script tidak merespons."
          )
        );

      }, 20000);


    window[callbackName] =
      function (data) {

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


    script.onerror =
      function () {

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
            "Gagal menghubungkan ke Google Apps Script."
          )
        );

      };


    script.src =
      API_URL +
      "?" +
      query.toString();

    script.async = true;

    document.head.appendChild(script);

  });

}


/* =========================================================
   API POST
   ========================================================= */

function apiPost(data) {

  data = data || {};

  var action =
    data.action || "";

  var params =
    Object.assign({}, data);

  delete params.action;

  return apiGet(
    action,
    params
  );

}


/* =========================================================
   TEST API
   ========================================================= */

async function testAPI() {

  try {

    var result =
      await apiGet("test");

    console.log(
      "API TEST:",
      result
    );

    setAPIStatus(true);

    return result;

  } catch (error) {

    console.error(
      "API TEST ERROR:",
      error
    );

    setAPIStatus(false);

    throw error;

  }

}


/* =========================================================
   API STATUS
   ========================================================= */

function setAPIStatus(connected) {

  var status =
    document.getElementById("apiStatus");

  if (!status) {
    return;
  }

  if (connected) {

    status.style.background =
      "#22c55e";

    status.title =
      "API Connected";

  } else {

    status.style.background =
      "#ef4444";

    status.title =
      "API Disconnected";

  }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function loadDashboard() {

  try {

    var result =
      await apiGet("dashboard");

    console.log(
      "DASHBOARD:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "Gagal mengambil dashboard."
      );

    }

    var data =
      result.data || {};

    setText(
      "totalKamar",
      data.totalKamar || 0
    );

    setText(
      "kamarTerisi",
      data.kamarTerisi || 0
    );

    setText(
      "kamarKosong",
      data.kamarKosong || 0
    );

    setText(
      "totalPenghuni",
      data.totalPenghuni || 0
    );

    setText(
      "bookingAktif",
      data.bookingAktif || 0
    );

    setText(
      "totalPendapatan",
      formatRupiah(
        data.totalPendapatan || 0
      )
    );

    setText(
      "dashboardMessage",
      "Data dashboard berhasil dimuat."
    );

    return result;

  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

    setText(
      "dashboardMessage",
      "Gagal memuat dashboard: " +
      error.message
    );

    throw error;

  }

}


/* =========================================================
   LOAD KAMAR
   ========================================================= */

async function loadKamar() {

  try {

    var result =
      await apiGet("kamar");

    console.log(
      "KAMAR:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "Gagal mengambil data kamar."
      );

    }

    renderKamar(
      result.data || []
    );

    return result;

  } catch (error) {

    console.error(
      "Kamar error:",
      error
    );

    throw error;

  }

}


/* =========================================================
   LOAD PENGHUNI
   ========================================================= */

async function loadPenghuni() {

  try {

    var result =
      await apiGet("penghuni");

    console.log(
      "PENGHUNI:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "Gagal mengambil data penghuni."
      );

    }

    renderPenghuni(
      result.data || []
    );

    return result;

  } catch (error) {

    console.error(
      "Penghuni error:",
      error
    );

    throw error;

  }

}


/* =========================================================
   LOAD PEMBAYARAN
   ========================================================= */

async function loadPembayaran() {

  try {

    var result =
      await apiGet("pembayaran");

    console.log(
      "PEMBAYARAN:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "Gagal mengambil data pembayaran."
      );

    }

    renderPembayaran(
      result.data || []
    );

    return result;

  } catch (error) {

    console.error(
      "Pembayaran error:",
      error
    );

    throw error;

  }

}


/* =========================================================
   SAVE KAMAR
   ========================================================= */

async function saveKamar(event) {

  if (event) {
    event.preventDefault();
  }

  var data = {

    nomorKamar:
      getValue("nomorKamar"),

    lantai:
      getValue("lantai"),

    tipe:
      getValue("tipe"),

    harga:
      getValue("harga"),

    status:
      getValue("statusKamar") || "KOSONG",

    fasilitas:
      getValue("fasilitas"),

    catatan:
      getValue("catatanKamar")

  };


  try {

    var result =
      await apiGet(
        "addKamar",
        data
      );

    console.log(
      "SAVE KAMAR:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "Gagal menyimpan kamar."
      );

    }

    alert(
      result.message ||
      "Kamar berhasil disimpan."
    );

    closeModal("kamarModal");

    resetForm("kamarForm");

    await loadKamar();

    await loadDashboard();

  } catch (error) {

    console.error(
      "Save kamar error:",
      error
    );

    alert(
      "Gagal menyimpan kamar: " +
      error.message
    );

  }

}


/* =========================================================
   SAVE PENGHUNI
   ========================================================= */

async function savePenghuni(event) {

  if (event) {
    event.preventDefault();
  }

  var data = {

    nama:
      getValue("namaPenghuni"),

    nik:
      getValue("nik"),

    noHp:
      getValue("noHp"),

    email:
      getValue("email"),

    kamarId:
      getValue("kamarId"),

    tanggalMasuk:
      getValue("tanggalMasuk"),

    tanggalKeluar:
      getValue("tanggalKeluar"),

    status:
      getValue("statusPenghuni") ||
      "AKTIF",

    catatan:
      getValue("catatanPenghuni")

  };


  try {

    var result =
      await apiGet(
        "addPenghuni",
        data
      );

    console.log(
      "SAVE PENGHUNI:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "Gagal menyimpan penghuni."
      );

    }

    alert(
      result.message ||
      "Penghuni berhasil disimpan."
    );

    closeModal("penghuniModal");

    resetForm("penghuniForm");

    await loadPenghuni();

    await loadDashboard();

  } catch (error) {

    console.error(
      "Save penghuni error:",
      error
    );

    alert(
      "Gagal menyimpan penghuni: " +
      error.message
    );

  }

}


/* =========================================================
   SAVE PEMBAYARAN
   ========================================================= */

async function savePembayaran(event) {

  if (event) {
    event.preventDefault();
  }

  var data = {

    penghuniId:
      getValue("penghuniId"),

    kontrakId:
      getValue("kontrakId"),

    periode:
      getValue("periode"),

    tanggalBayar:
      getValue("tanggalBayar"),

    jumlah:
      getValue("jumlah"),

    metode:
      getValue("metode"),

    status:
      getValue("statusPembayaran") ||
      "LUNAS",

    keterangan:
      getValue("keterangan"),

    buktiBayar:
      getValue("buktiBayar")

  };


  try {

    var result =
      await apiGet(
        "addPembayaran",
        data
      );

    console.log(
      "SAVE PEMBAYARAN:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "Gagal menyimpan pembayaran."
      );

    }

    alert(
      result.message ||
      "Pembayaran berhasil disimpan."
    );

    closeModal("pembayaranModal");

    resetForm("pembayaranForm");

    await loadPembayaran();

    await loadDashboard();

  } catch (error) {

    console.error(
      "Save pembayaran error:",
      error
    );

    alert(
      "Gagal menyimpan pembayaran: " +
      error.message
    );

  }

}


/* =========================================================
   SHOW PAGE
   ========================================================= */

function showPage(pageName) {

  var pages =
    document.querySelectorAll(".page");

  pages.forEach(function (page) {

    page.style.display =
      "none";

    page.classList.remove("active");

  });


  var target =
    document.getElementById(pageName);

  if (!target) {

    console.warn(
      "Halaman tidak ditemukan:",
      pageName
    );

    return;

  }


  target.style.display =
    "block";

  target.classList.add("active");


  var title =
    document.getElementById("pageTitle");

  if (title) {

    var titles = {

      dashboard: "Dashboard",

      kamar: "Kamar",

      penghuni: "Penghuni",

      booking: "Booking",

      kontrak: "Kontrak",

      pembayaran: "Pembayaran",

      invoice: "Invoice"

    };

    title.textContent =
      titles[pageName] || "Kost Putri";

  }


  if (pageName === "dashboard") {
    loadDashboard();
  }

  if (pageName === "kamar") {
    loadKamar();
  }

  if (pageName === "penghuni") {
    loadPenghuni();
  }

  if (pageName === "pembayaran") {
    loadPembayaran();
  }

}


/* =========================================================
   OPEN KAMAR FORM
   ========================================================= */

function openKamarForm() {

  openModal("kamarModal");

}


/* =========================================================
   OPEN PENGHUNI FORM
   ========================================================= */

function openPenghuniForm() {

  openModal("penghuniModal");

}


/* =========================================================
   OPEN PEMBAYARAN FORM
   ========================================================= */

function openPembayaranForm() {

  openModal("pembayaranModal");

}


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openModal(id) {

  var modal =
    document.getElementById(id);

  if (!modal) {
    return;
  }

  modal.style.display =
    "flex";

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal(id) {

  var modal =
    document.getElementById(id);

  if (!modal) {
    return;
  }

  modal.style.display =
    "none";

}


/* =========================================================
   RENDER KAMAR
   ========================================================= */

function renderKamar(data) {

  var tbody =
    document.getElementById("kamarTable");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    tbody.innerHTML =
      '<tr>' +
      '<td colspan="7">' +
      'Belum ada data kamar.' +
      '</td>' +
      '</tr>';

    return;

  }


  data.forEach(function (row) {

    var tr =
      document.createElement("tr");


    tr.innerHTML =
      "<td>" +
      escapeHTML(row.KAMAR_ID) +
      "</td>" +

      "<td>" +
      escapeHTML(row.NOMOR_KAMAR) +
      "</td>" +

      "<td>" +
      escapeHTML(row.LANTAI) +
      "</td>" +

      "<td>" +
      escapeHTML(row.TIPE) +
      "</td>" +

      "<td>" +
      formatRupiah(row.HARGA) +
      "</td>" +

      "<td>" +
      escapeHTML(row.STATUS) +
      "</td>" +

      "<td>" +
      escapeHTML(row.FASILITAS) +
      "</td>";


    tbody.appendChild(tr);

  });

}


/* =========================================================
   RENDER PENGHUNI
   ========================================================= */

function renderPenghuni(data) {

  var tbody =
    document.getElementById("penghuniTable");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    tbody.innerHTML =
      '<tr>' +
      '<td colspan="6">' +
      'Belum ada data penghuni.' +
      '</td>' +
      '</tr>';

    return;

  }


  data.forEach(function (row) {

    var tr =
      document.createElement("tr");


    tr.innerHTML =
      "<td>" +
      escapeHTML(row.PENGHUNI_ID) +
      "</td>" +

      "<td>" +
      escapeHTML(row.NAMA) +
      "</td>" +

      "<td>" +
      escapeHTML(row.NO_HP) +
      "</td>" +

      "<td>" +
      escapeHTML(row.KAMAR_ID) +
      "</td>" +

      "<td>" +
      formatDate(row.TANGGAL_MASUK) +
      "</td>" +

      "<td>" +
      escapeHTML(row.STATUS) +
      "</td>";


    tbody.appendChild(tr);

  });

}


/* =========================================================
   RENDER PEMBAYARAN
   ========================================================= */

function renderPembayaran(data) {

  var tbody =
    document.getElementById("pembayaranTable");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    tbody.innerHTML =
      '<tr>' +
      '<td colspan="9">' +
      'Belum ada data pembayaran.' +
      '</td>' +
      '</tr>';

    return;

  }


  data.forEach(function (row) {

    var tr =
      document.createElement("tr");


    tr.innerHTML =
      "<td>" +
      escapeHTML(row.PEMBAYARAN_ID) +
      "</td>" +

      "<td>" +
      escapeHTML(row.PENGHUNI_ID) +
      "</td>" +

      "<td>" +
      escapeHTML(row.KONTRAK_ID) +
      "</td>" +

      "<td>" +
      escapeHTML(row.PERIODE) +
      "</td>" +

      "<td>" +
      formatDate(row.TANGGAL_BAYAR) +
      "</td>" +

      "<td>" +
      formatRupiah(row.JUMLAH) +
      "</td>" +

      "<td>" +
      escapeHTML(row.METODE) +
      "</td>" +

      "<td>" +
      escapeHTML(row.STATUS) +
      "</td>" +

      "<td>" +
      escapeHTML(row.KETERANGAN) +
      "</td>";


    tbody.appendChild(tr);

  });

}


/* =========================================================
   GET VALUE
   ========================================================= */

function getValue(id) {

  var element =
    document.getElementById(id);

  if (!element) {
    return "";
  }

  return element.value || "";

}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(id, value) {

  var element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  element.textContent =
    value;

}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetForm(id) {

  var form =
    document.getElementById(id);

  if (!form) {
    return;
  }

  form.reset();

}


/* =========================================================
   FORMAT RUPIAH
   ========================================================= */

function formatRupiah(value) {

  var number =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(number);

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

  if (!value) {
    return "-";
  }

  var date =
    new Date(value);

  if (isNaN(date.getTime())) {

    return escapeHTML(value);

  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   INIT APPLICATION
   ========================================================= */

async function initApp() {

  console.log(
    "================================="
  );

  console.log(
    "KOST PUTRI APP START"
  );

  console.log(
    "API:",
    API_URL
  );

  console.log(
    "================================="
  );


  try {

    var test =
      await testAPI();


    if (
      !test ||
      test.success !== true
    ) {

      throw new Error(
        test && test.message
          ? test.message
          : "API tidak aktif."
      );

    }


    console.log(
      "API CONNECTED"
    );


    await loadDashboard();

    await loadKamar();

    await loadPenghuni();

    await loadPembayaran();


    console.log(
      "DATA BERHASIL DIMUAT"
    );


  } catch (error) {

    console.error(
      "INIT ERROR:",
      error
    );

    var loading =
      document.getElementById("loading");

    if (loading) {

      loading.style.display =
        "block";

      loading.textContent =
        "Gagal memuat data: " +
        error.message;

    }

  }

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.apiGet =
  apiGet;

window.apiPost =
  apiPost;

window.testAPI =
  testAPI;

window.initApp =
  initApp;

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

window.loginUser =
  loginUser;

window.logoutUser =
  logoutUser;


/* =========================================================
   END
   ========================================================= */
```
