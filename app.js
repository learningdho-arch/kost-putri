/*************************************************
 * KOST PUTRI MANAGEMENT SYSTEM
 * GITHUB PAGES → APPS SCRIPT → GOOGLE SHEETS
 *************************************************/


/**
 * =================================================
 * URL GOOGLE APPS SCRIPT WEB APP
 * =================================================
 */

const API_URL =
  'https://script.google.com/macros/s/AKfycbyQKGeA74rDh6jv1aQn2t0wAoIxmA2lhIlVY_ToR6gsX0BsWygwvLGMiXnMIO0OFjJWzw/exec';


/**
 * =================================================
 * API GET
 * =================================================
 */

async function apiGet(action) {

  const url =
    API_URL +
    '?action=' +
    encodeURIComponent(action);

  try {

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(
        'HTTP Error ' + response.status
      );
    }

    const text =
      await response.text();

    let result;

    try {

      result =
        JSON.parse(text);

    } catch (error) {

      console.error(
        'Response Apps Script:',
        text
      );

      throw new Error(
        'Response dari Apps Script bukan JSON.'
      );

    }

    return result;

  } catch (error) {

    console.error(
      'API GET Error:',
      error
    );

    throw error;

  }

}


/**
 * =================================================
 * API POST
 * =================================================
 */

async function apiPost(data) {

  try {

    const response = await fetch(
      API_URL,
      {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type':
            'text/plain;charset=utf-8'
        },
        body:
          JSON.stringify(data)
      }
    );

    if (!response.ok) {

      throw new Error(
        'HTTP Error ' +
        response.status
      );

    }

    const text =
      await response.text();

    let result;

    try {

      result =
        JSON.parse(text);

    } catch (error) {

      console.error(
        'Response Apps Script:',
        text
      );

      throw new Error(
        'Response dari Apps Script bukan JSON.'
      );

    }

    return result;

  } catch (error) {

    console.error(
      'API POST Error:',
      error
    );

    throw error;

  }

}


/**
 * =================================================
 * FORMAT RUPIAH
 * =================================================
 */

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


/**
 * =================================================
 * DASHBOARD
 * =================================================
 */

async function loadDashboard() {

  const message =
    document.getElementById(
      'dashboardMessage'
    );

  try {

    if (message) {

      message.innerText =
        'Memuat data...';

    }

    const result =
      await apiGet(
        'dashboard'
      );

    if (!result.success) {

      throw new Error(
        result.message ||
        'Gagal mengambil data dashboard.'
      );

    }

    const data =
      result.data || {};


    const totalKamar =
      document.getElementById(
        'totalKamar'
      );

    const kamarKosong =
      document.getElementById(
        'kamarKosong'
      );

    const kamarTerisi =
      document.getElementById(
        'kamarTerisi'
      );

    const totalPenghuni =
      document.getElementById(
        'totalPenghuni'
      );

    const bookingAktif =
      document.getElementById(
        'bookingAktif'
      );

    const totalPendapatan =
      document.getElementById(
        'totalPendapatan'
      );


    if (totalKamar) {

      totalKamar.innerText =
        data.totalKamar || 0;

    }


    if (kamarKosong) {

      kamarKosong.innerText =
        data.kamarKosong || 0;

    }


    if (kamarTerisi) {

      kamarTerisi.innerText =
        data.kamarTerisi || 0;

    }


    if (totalPenghuni) {

      totalPenghuni.innerText =
        data.totalPenghuni || 0;

    }


    if (bookingAktif) {

      bookingAktif.innerText =
        data.bookingAktif || 0;

    }


    if (totalPendapatan) {

      totalPendapatan.innerText =
        formatRupiah(
          data.totalPendapatan || 0
        );

    }


    if (message) {

      message.innerText =
        'Data berhasil dimuat dari Google Sheets.';

    }


    setApiStatus(true);

  } catch (error) {

    console.error(
      'Dashboard Error:',
      error
    );

    if (message) {

      message.innerText =
        'Gagal mengambil data: ' +
        error.message;

    }

    setApiStatus(false);

  }

}


/**
 * =================================================
 * LOAD KAMAR
 * =================================================
 */

async function loadKamar() {

  try {

    const result =
      await apiGet(
        'kamar'
      );

    if (!result.success) {

      throw new Error(
        result.message ||
        'Gagal mengambil data kamar.'
      );

    }

    const table =
      document.getElementById(
        'kamarTable'
      );

    if (!table) {

      console.warn(
        'Element kamarTable tidak ditemukan.'
      );

      return;

    }

    table.innerHTML = '';


    if (
      !result.data ||
      result.data.length === 0
    ) {

      table.innerHTML = `
        <tr>
          <td
            colspan="7"
            style="text-align:center">
            Belum ada data kamar.
          </td>
        </tr>
      `;

      return;

    }


    result.data.forEach(
      function(row) {

        const tr =
          document.createElement(
            'tr'
          );


        tr.innerHTML = `

          <td>
            ${escapeHtml(
              row.KAMAR_ID
            )}
          </td>

          <td>
            ${escapeHtml(
              row.NOMOR_KAMAR
            )}
          </td>

          <td>
            ${escapeHtml(
              row.LANTAI
            )}
          </td>

          <td>
            ${escapeHtml(
              row.TIPE
            )}
          </td>

          <td>
            ${formatRupiah(
              row.HARGA
            )}
          </td>

          <td>
            ${escapeHtml(
              row.STATUS
            )}
          </td>

          <td>
            ${escapeHtml(
              row.FASILITAS
            )}
          </td>

        `;


        table.appendChild(
          tr
        );

      }
    );


  } catch (error) {

    console.error(
      'Load Kamar Error:',
      error
    );

    alert(
      'Gagal mengambil data kamar: ' +
      error.message
    );

  }

}


/**
 * =================================================
 * LOAD PENGHUNI
 * =================================================
 */

async function loadPenghuni() {

  try {

    const result =
      await apiGet(
        'penghuni'
      );

    if (!result.success) {

      throw new Error(
        result.message ||
        'Gagal mengambil data penghuni.'
      );

    }


    const table =
      document.getElementById(
        'penghuniTable'
      );

    if (!table) {

      console.warn(
        'Element penghuniTable tidak ditemukan.'
      );

      return;

    }


    table.innerHTML = '';


    if (
      !result.data ||
      result.data.length === 0
    ) {

      table.innerHTML = `
        <tr>
          <td
            colspan="6"
            style="text-align:center">
            Belum ada data penghuni.
          </td>
        </tr>
      `;

      return;

    }


    result.data.forEach(
      function(row) {

        const tr =
          document.createElement(
            'tr'
          );


        tr.innerHTML = `

          <td>
            ${escapeHtml(
              row.PENGHUNI_ID
            )}
          </td>

          <td>
            ${escapeHtml(
              row.NAMA
            )}
          </td>

          <td>
            ${escapeHtml(
              row.NO_HP
            )}
          </td>

          <td>
            ${escapeHtml(
              row.KAMAR_ID
            )}
          </td>

          <td>
            ${formatDate(
              row.TANGGAL_MASUK
            )}
          </td>

          <td>
            ${escapeHtml(
              row.STATUS
            )}
          </td>

        `;


        table.appendChild(
          tr
        );

      }
    );


  } catch (error) {

    console.error(
      'Load Penghuni Error:',
      error
    );

    alert(
      'Gagal mengambil data penghuni: ' +
      error.message
    );

  }

}


/**
 * =================================================
 * SIMPAN KAMAR
 * =================================================
 */

async function saveKamar(event) {

  event.preventDefault();


  const nomorKamar =
    document.getElementById(
      'nomorKamar'
    );

  const lantai =
    document.getElementById(
      'lantai'
    );

  const tipe =
    document.getElementById(
      'tipe'
    );

  const harga =
    document.getElementById(
      'harga'
    );

  const status =
    document.getElementById(
      'statusKamar'
    );

  const fasilitas =
    document.getElementById(
      'fasilitas'
    );

  const catatan =
    document.getElementById(
      'catatanKamar'
    );


  const data = {

    action:
      'addKamar',

    nomorKamar:
      nomorKamar
        ? nomorKamar.value
        : '',

    lantai:
      lantai
        ? lantai.value
        : '',

    tipe:
      tipe
        ? tipe.value
        : '',

    harga:
      harga
        ? harga.value
        : '',

    status:
      status
        ? status.value
        : 'KOSONG',

    fasilitas:
      fasilitas
        ? fasilitas.value
        : '',

    catatan:
      catatan
        ? catatan.value
        : ''

  };


  try {

    const result =
      await apiPost(
        data
      );


    if (!result.success) {

      throw new Error(
        result.message ||
        'Gagal menyimpan kamar.'
      );

    }


    alert(
      'Kamar berhasil disimpan.'
    );


    closeModal(
      'kamarModal'
    );


    if (event.target) {

      event.target.reset();

    }


    await loadKamar();

    await loadDashboard();


  } catch (error) {

    console.error(
      'Save Kamar Error:',
      error
    );

    alert(
      'Gagal menyimpan kamar: ' +
      error.message
    );

  }

}


/**
 * =================================================
 * SIMPAN PENGHUNI
 * =================================================
 */

async function savePenghuni(event) {

  event.preventDefault();


  const nama =
    document.getElementById(
      'namaPenghuni'
    );

  const nik =
    document.getElementById(
      'nik'
    );

  const noHp =
    document.getElementById(
      'noHp'
    );

  const email =
    document.getElementById(
      'email'
    );

  const kamarId =
    document.getElementById(
      'kamarId'
    );

  const tanggalMasuk =
    document.getElementById(
      'tanggalMasuk'
    );

  const catatan =
    document.getElementById(
      'catatanPenghuni'
    );


  const data = {

    action:
      'addPenghuni',

    nama:
      nama
        ? nama.value
        : '',

    nik:
      nik
        ? nik.value
        : '',

    noHp:
      noHp
        ? noHp.value
        : '',

    email:
      email
        ? email.value
        : '',

    kamarId:
      kamarId
        ? kamarId.value
        : '',

    tanggalMasuk:
      tanggalMasuk
        ? tanggalMasuk.value
        : '',

    catatan:
      catatan
        ? catatan.value
        : ''

  };


  try {

    console.log(
      'Mengirim data penghuni:',
      data
    );


    const result =
      await apiPost(
        data
      );


    console.log(
      'Response penghuni:',
      result
    );


    if (!result.success) {

      throw new Error(
        result.message ||
        'Gagal menyimpan penghuni.'
      );

    }


    alert(
      'Penghuni berhasil disimpan.'
    );


    closeModal(
      'penghuniModal'
    );


    if (event.target) {

      event.target.reset();

    }


    await loadPenghuni();

    await loadDashboard();


  } catch (error) {

    console.error(
      'Save Penghuni Error:',
      error
    );

    alert(
      'Gagal menyimpan penghuni: ' +
      error.message
    );

  }

}


/**
 * =================================================
 * NAVIGATION
 * =================================================
 */

function showPage(pageName) {

  document
    .querySelectorAll(
      '.page'
    )
    .forEach(
      function(page) {

        page.classList.remove(
          'active'
        );

      }
    );


  const page =
    document.getElementById(
      pageName
    );


  if (page) {

    page.classList.add(
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


  const pageTitle =
    document.getElementById(
      'pageTitle'
    );


  if (pageTitle) {

    pageTitle.innerText =
      titles[pageName] ||
      'Dashboard';

  }


  if (
    pageName ===
    'dashboard'
  ) {

    loadDashboard();

  }


  if (
    pageName ===
    'kamar'
  ) {

    loadKamar();

  }


  if (
    pageName ===
    'penghuni'
  ) {

    loadPenghuni();

  }

}


/**
 * =================================================
 * MODAL KAMAR
 * =================================================
 */

function openKamarForm() {

  const modal =
    document.getElementById(
      'kamarModal'
    );


  if (modal) {

    modal.classList.add(
      'show'
    );

  }

}


/**
 * =================================================
 * MODAL PENGHUNI
 * =================================================
 */

function openPenghuniForm() {

  const modal =
    document.getElementById(
      'penghuniModal'
    );


  if (modal) {

    modal.classList.add(
      'show'
    );

  }

}


/**
 * =================================================
 * CLOSE MODAL
 * =================================================
 */

function closeModal(id) {

  const modal =
    document.getElementById(
      id
    );


  if (modal) {

    modal.classList.remove(
      'show'
    );

  }

}


/**
 * =================================================
 * API STATUS
 * =================================================
 */

function setApiStatus(online) {

  const dot =
    document.getElementById(
      'apiStatus'
    );


  if (!dot) {

    return;

  }


  if (online) {

    dot.style.background =
      'green';

    dot.title =
      'API Online';

  } else {

    dot.style.background =
      'red';

    dot.title =
      'API Offline';

  }

}


/**
 * =================================================
 * FORMAT DATE
 * =================================================
 */

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

    return String(value);

  }


  return date.toLocaleDateString(
    'id-ID'
  );

}


/**
 * =================================================
 * SECURITY
 * =================================================
 */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return '';

  }


  return String(value)

    .replaceAll(
      '&',
      '&amp;'
    )

    .replaceAll(
      '<',
      '&lt;'
    )

    .replaceAll(
      '>',
      '&gt;'
    )

    .replaceAll(
      '"',
      '&quot;'
    )

    .replaceAll(
      "'",
      '&#039;'
    );

}


/**
 * =================================================
 * START APPLICATION
 * =================================================
 */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    console.log(
      'Kost Putri Application dimulai...'
    );

    loadDashboard();

  }
);
