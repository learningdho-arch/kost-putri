/*************************************************
 * KOST PUTRI
 * GITHUB PAGES → APPS SCRIPT → GOOGLE SHEETS
 *************************************************/


/*
 * =================================================
 * MASUKKAN URL APPS SCRIPT /exec KAMU DI SINI
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

  const response =
    await fetch(
      API_URL +
      '?action=' +
      encodeURIComponent(action)
    );


  if (!response.ok) {

    throw new Error(
      'API error: ' +
      response.status
    );

  }


  return await response.json();

}

}



/**
 * =================================================
 * API POST
 * =================================================
 */

async function apiPost(data) {

  const response =
    await fetch(
      API_URL,
      {

        method: 'POST',

        body:
          JSON.stringify(data)

      }
    );


  if (!response.ok) {

    throw new Error(
      'API error: ' +
      response.status
    );

  }


  return await response.json();

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

  try {

    const result =
      await apiGet(
        'dashboard'
      );


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    const data =
      result.data;


    document.getElementById(
      'totalKamar'
    ).innerText =
      data.totalKamar;


    document.getElementById(
      'kamarKosong'
    ).innerText =
      data.kamarKosong;


    document.getElementById(
      'kamarTerisi'
    ).innerText =
      data.kamarTerisi;


    document.getElementById(
      'totalPenghuni'
    ).innerText =
      data.totalPenghuni;


    document.getElementById(
      'bookingAktif'
    ).innerText =
      data.bookingAktif;


    document.getElementById(
      'totalPendapatan'
    ).innerText =
      formatRupiah(
        data.totalPendapatan
      );


    document.getElementById(
      'dashboardMessage'
    ).innerText =
      'Data berhasil dimuat dari Google Sheets.';


    setApiStatus(
      true
    );


  } catch (error) {

    console.error(error);


    document.getElementById(
      'dashboardMessage'
    ).innerText =
      'Gagal mengambil data: ' +
      error.message;


    setApiStatus(
      false
    );

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


    const table =
      document.getElementById(
        'kamarTable'
      );


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

    console.error(error);

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


    const table =
      document.getElementById(
        'penghuniTable'
      );


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

    console.error(error);

    alert(
      'Gagal mengambil data penghuni: ' +
      error.message
    );

  }

}



/**
 * =================================================
 * TAMBAH KAMAR
 * =================================================
 */

async function saveKamar(event) {

  event.preventDefault();


  const data = {

    action:
      'addKamar',

    nomorKamar:
      document.getElementById(
        'nomorKamar'
      ).value,

    lantai:
      document.getElementById(
        'lantai'
      ).value,

    tipe:
      document.getElementById(
        'tipe'
      ).value,

    harga:
      document.getElementById(
        'harga'
      ).value,

    status:
      document.getElementById(
        'statusKamar'
      ).value,

    fasilitas:
      document.getElementById(
        'fasilitas'
      ).value,

    catatan:
      document.getElementById(
        'catatanKamar'
      ).value

  };


  try {

    const result =
      await apiPost(
        data
      );


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    alert(
      'Kamar berhasil disimpan.'
    );


    closeModal(
      'kamarModal'
    );


    event.target.reset();


    await loadKamar();

    await loadDashboard();


  } catch (error) {

    console.error(error);

    alert(
      'Gagal menyimpan kamar: ' +
      error.message
    );

  }

}



/**
 * =================================================
 * TAMBAH PENGHUNI
 * =================================================
 */

async function savePenghuni(event) {

  event.preventDefault();


  const data = {

    action:
      'addPenghuni',

    nama:
      document.getElementById(
        'namaPenghuni'
      ).value,

    nik:
      document.getElementById(
        'nik'
      ).value,

    noHp:
      document.getElementById(
        'noHp'
      ).value,

    email:
      document.getElementById(
        'email'
      ).value,

    kamarId:
      document.getElementById(
        'kamarId'
      ).value,

    tanggalMasuk:
      document.getElementById(
        'tanggalMasuk'
      ).value,

    catatan:
      document.getElementById(
        'catatanPenghuni'
      ).value

  };


  try {

    const result =
      await apiPost(
        data
      );


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    alert(
      'Penghuni berhasil disimpan.'
    );


    closeModal(
      'penghuniModal'
    );


    event.target.reset();


    await loadPenghuni();

    await loadDashboard();


  } catch (error) {

    console.error(error);

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


  document.getElementById(
    'pageTitle'
  ).innerText =
    titles[pageName] ||
    'Dashboard';


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
 * MODAL
 * =================================================
 */

function openKamarForm() {

  document
    .getElementById(
      'kamarModal'
    )
    .classList.add(
      'show'
    );

}


function openPenghuniForm() {

  document
    .getElementById(
      'penghuniModal'
    )
    .classList.add(
      'show'
    );

}


function closeModal(id) {

  document
    .getElementById(id)
    .classList.remove(
      'show'
    );

}



/**
 * =================================================
 * API STATUS
 * =================================================
 */

function setApiStatus(
  online
) {

  const dot =
    document.getElementById(
      'apiStatus'
    );


  if (online) {

    dot.style.background =
      'green';

  } else {

    dot.style.background =
      'red';

  }

}



/**
 * =================================================
 * DATE
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

    return value;

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

    loadDashboard();

  }
);
