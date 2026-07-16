// ==========================================
// 1. KEAMANAN & AUTENTIKASI
// ==========================================
if (!localStorage.getItem("iot_token")) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("iot_token");
  window.location.href = "login.html";
}

// Paginasi & Pencarian
let currentPage = 1;
let rowsPerPage = 100;
let totalRecords = 0;
let currentDeviceId = null;
let searchKeyword = ""; // Variabel baru untuk fitur pencarian

// ==========================================
// 2. VARIABEL DOM
// ==========================================
const DOM = {
  dropdown: document.getElementById("deviceDropdown"),
  tableBody: document.getElementById("deviceTableBody"),
  statusSampah: document.getElementById("statusSampah"),
  statusTutup: document.getElementById("statusTutup"),
  persentase: document.getElementById("persentase"),
  jarakObjek: document.getElementById("jarakObjek"),
  jarakSampah: document.getElementById("jarakSampah"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  historyTable: document.getElementById("historyTable"),
  notificationBox: document.getElementById("notificationBox"),
  notificationList: document.getElementById("notificationList"),
  onlineStatus: document.querySelector(".status-online"),
  deviceName: document.getElementById("deviceName"),
  deviceLocation: document.getElementById("deviceLocation"),
  deviceESP32: document.getElementById("deviceESP32"),
  deviceWifi: document.getElementById("deviceWifi"),
  deviceServer: document.getElementById("deviceServer"),
  deviceDatabase: document.getElementById("deviceDatabase"),
  deviceWhatsapp: document.getElementById("deviceWhatsapp"),
  lastUpdate: document.getElementById("lastUpdate"),
  searchInput: document.getElementById("searchInput"), // Input Cari Baru
};

// ==========================================
// 3. EVENT LISTENER DROPDOWN
// ==========================================
DOM.dropdown.addEventListener("change", (e) => {
  currentDeviceId = e.target.value;
  currentPage = 1;
  searchKeyword = ""; // Reset pencarian saat ganti perangkat
  if (DOM.searchInput) DOM.searchInput.value = "";
  loadDashboard();
  loadHistoryPage();
});

// ==========================================
// 4. FUNGSI LOAD DATA (API)
// ==========================================
async function loadDeviceList() {
  const devices = await getAllDevices();
  if (!devices || devices.length === 0) return;

  DOM.dropdown.innerHTML = devices
    .map(
      (dev) =>
        `<option value="${dev.device_code}" ${dev.device_code === currentDeviceId ? "selected" : ""}>${dev.nama} (${dev.device_code})</option>`,
    )
    .join("");

  DOM.tableBody.innerHTML = devices
    .map(
      (dev) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${dev.device_code}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${dev.nama}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${dev.lokasi}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${dev.wa_target || "-"}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                <button onclick="openModal('edit', '${dev.device_code}', '${dev.nama}', '${dev.lokasi}', '${dev.wa_target}')" style="background: #ff9800; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; margin-right: 5px;"><i class="fa-solid fa-pen"></i></button>
                <button onclick="hapusPerangkat('${dev.device_code}')" style="background: #e53935; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `,
    )
    .join("");
}

async function loadDashboard() {
  if (!currentDeviceId) return;

  const [current, historyResult] = await Promise.all([
    getCurrentStatus(currentDeviceId),
    getHistory(currentDeviceId, 1, 100, ""), // Dashboard tidak dipengaruhi pencarian
  ]);

  await loadDevice();

  if (current) {
    DOM.statusSampah.innerText = current.status_sampah;
    DOM.statusTutup.innerText = current.status_tutup;
    DOM.persentase.innerText = current.persentase;
    DOM.jarakObjek.innerText = current.jarak_objek;
    DOM.jarakSampah.innerText = current.jarak_sampah;

    // Perbaikan ID Card Device agar tidak error
    const cardDev = document.getElementById("cardDeviceCode");
    if (cardDev) cardDev.innerText = current.device_code;

    DOM.progressBar.style.width = current.persentase + "%";
    DOM.progressBar.style.background =
      current.persentase < 40
        ? "#00C897"
        : current.persentase < 80
          ? "#ff9800"
          : "#e53935";
    DOM.progressText.innerText = current.persentase + "%";

    DOM.notificationBox.innerHTML =
      current.status_sampah === "Penuh"
        ? `<span style="color: #e53935; font-weight: bold;">⚠️ Peringatan:</span> Tong sampah penuh!`
        : `<span style="color: #00C897; font-weight: bold;">✅ Normal:</span> Kondisi aman.`;
  }

  if (historyResult && Array.isArray(historyResult.data)) {
    if (typeof updateChart === "function") updateChart(historyResult.data);

    if (DOM.notificationList) {
      const logsPenuh = historyResult.data
        .filter((item) => item.status_sampah === "Penuh")
        .slice(0, 10);
      if (logsPenuh.length > 0) {
        DOM.notificationList.innerHTML = logsPenuh
          .map(
            (item) => `
              <div style="padding: 15px; border-left: 5px solid #e53935; background: #ffebee; border-radius: 8px; margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <strong style="color: #c62828;"><i class="fa-solid fa-bell"></i> Peringatan</strong>
                      <span style="font-size: 12px;">${formatDate(item.created_at)}</span>
                  </div>
                  <p style="margin: 0; font-size: 14px;">Tong sampah terdeteksi <b>Penuh</b> (${item.persentase}%).</p>
              </div>
          `,
          )
          .join("");
      } else {
        DOM.notificationList.innerHTML = `<div style="text-align: center; color: #999; padding: 20px;">Tidak ada log peringatan terbaru.</div>`;
      }
    }
  }
}

async function loadDevice() {
  if (!currentDeviceId) return;
  const device = await getDevice(currentDeviceId);
  if (!device) return;

  DOM.deviceName.innerText = device.nama;
  DOM.deviceLocation.innerText = device.lokasi;
  DOM.deviceESP32.innerHTML = device.esp32 ? "🟢 ONLINE" : "🔴 OFFLINE";
  DOM.deviceWifi.innerHTML = device.wifi ? "🟢 CONNECTED" : "🔴 DISCONNECTED";
  DOM.deviceServer.innerHTML = device.server ? "🟢 ONLINE" : "🔴 OFFLINE";
  DOM.deviceDatabase.innerHTML = device.database ? "🟢 CONNECTED" : "🔴 ERROR";
  DOM.deviceWhatsapp.innerHTML = device.whatsapp ? "🟢 READY" : "🔴 ERROR";
  DOM.lastUpdate.innerText = device.last_update
    ? new Date(device.last_update).toLocaleString("id-ID")
    : "-";
}

async function checkConnection() {
  const online = await checkServer();
  DOM.onlineStatus.innerHTML = online
    ? `<span class="dot"></span> ONLINE`
    : `<span class="dot"></span> OFFLINE`;
  DOM.onlineStatus.style.background = online ? "#00C897" : "#e53935";
}

// ==========================================
// 5. FUNGSI PENCARIAN & PAGINASI
// ==========================================
function applySearch() {
  if (DOM.searchInput) {
    searchKeyword = DOM.searchInput.value.trim();
    currentPage = 1; // Kembali ke halaman 1 saat mencari
    loadHistoryPage();
  }
}

async function loadHistoryPage() {
  if (!currentDeviceId) return;
  // Memasukkan searchKeyword ke API
  const result = await getHistory(
    currentDeviceId,
    currentPage,
    rowsPerPage,
    searchKeyword,
  );

  if (!result || !result.data || result.data.length === 0) {
    DOM.historyTable.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #999;">Tidak ada data yang ditemukan.</td></tr>`;
    document.getElementById("totalRecords").innerText = `0 records`;
    return;
  }

  DOM.historyTable.innerHTML = result.data
    .map(
      (item) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${formatDate(item.created_at)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.status_tutup}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.status_sampah}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.persentase}%</td>
        </tr>
    `,
    )
    .join("");

  totalRecords = result.count;
  document.getElementById("currentPage").innerText = currentPage;
  document.getElementById("totalPages").innerText =
    Math.ceil(totalRecords / rowsPerPage) || 1;
  document.getElementById("totalRecords").innerText = `${totalRecords} records`;
}

function changePage(direction) {
  const maxPage = Math.ceil(totalRecords / rowsPerPage);
  currentPage += direction;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > maxPage) currentPage = maxPage;
  loadHistoryPage();
}

function updateRowsPerPage() {
  rowsPerPage = parseInt(document.getElementById("rowsPerPage").value);
  currentPage = 1;
  loadHistoryPage();
}

// ==========================================
// 6. FUNGSI CRUD PERANGKAT (MODAL)
// ==========================================
let crudMode = "add";

function openModal(mode, code = "", name = "", location = "", wa = "") {
  crudMode = mode;
  document.getElementById("crudModal").style.display = "flex";
  document.getElementById("modalTitle").innerText =
    mode === "add" ? "Tambah Perangkat" : "Edit Perangkat";

  document.getElementById("inputCode").value = code;
  document.getElementById("inputCode").disabled = mode === "edit";
  document.getElementById("inputName").value = name;
  document.getElementById("inputLocation").value = location;
  document.getElementById("inputWA").value = wa;
}

function closeModal() {
  document.getElementById("crudModal").style.display = "none";
}

const crudForm = document.getElementById("crudForm");
if (crudForm) {
  crudForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSimpan");
    btn.innerText = "Menyimpan...";

    const data = {
      device_code: document.getElementById("inputCode").value,
      nama: document.getElementById("inputName").value,
      lokasi: document.getElementById("inputLocation").value,
      wa_target: document.getElementById("inputWA").value,
    };

    let result;
    if (crudMode === "add") result = await createDevice(data);
    else result = await updateDevice(data.device_code, data);

    if (result && result.success) {
      alert("Operasi berhasil disimpan!");
      closeModal();
      await loadDeviceList();
    } else {
      alert(
        "Gagal: " + (result?.message || result?.error || "Kesalahan server"),
      );
    }
    btn.innerText = "Simpan";
  });
}

async function hapusPerangkat(id) {
  if (confirm(`Yakin ingin menghapus perangkat ${id}?`)) {
    const result = await deleteDevice(id);
    if (result && result.success) {
      alert("Perangkat berhasil dihapus.");
      await loadDeviceList();
      if (currentDeviceId === id) {
        currentDeviceId =
          DOM.dropdown.options.length > 0
            ? DOM.dropdown.options[0].value
            : null;
        loadDashboard();
      }
    } else {
      alert("Gagal menghapus perangkat.");
    }
  }
}

// ==========================================
// 7. INISIALISASI
// ==========================================
function initNavigation() {
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".menu-item")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".page-content")
        .forEach((page) => (page.style.display = "none"));
      item.classList.add("active");

      const target = item.getAttribute("data-target");
      document.getElementById(target).style.display = "block";

      if (target === "page-manajemen") loadDeviceList();
      if (target === "page-riwayat") loadHistoryPage();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof initChart === "function") initChart();
  initNavigation();

  // Pemicu cari jika menekan tombol 'Enter'
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") applySearch();
    });
  }

  await loadDeviceList();

  if (DOM.dropdown && DOM.dropdown.options.length > 0) {
    currentDeviceId = DOM.dropdown.options[0].value;
  }

  await loadDashboard();
  await checkConnection();

  setInterval(loadDashboard, 5000);
  setInterval(checkConnection, 10000);
});
