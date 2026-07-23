// ======================================================
// SMART TRASH API - CLIENT
// ======================================================

// Ganti link yang lama menjadi seperti ini:
const BASE_URL = "https://terms-captured-vbulletin-qty.trycloudflare.com/api";

// Fungsi pembantu untuk fetch
async function request(url, options = {}) {
  try {
    const response = await fetch(url, options);
    // Tidak langsung throw error agar pesan JSON dari backend (jika ada) tetap terbaca
    if (!response.ok) {
      console.warn(`Peringatan HTTP: ${response.status} pada ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API ERROR :", error);
    return null;
  }
}

// ======================================================
// FUNGSI UTAMA (Menerima parameter ID dinamis)
// ======================================================

// Mengambil data history dari backend dengan paginasi dan pencarian
async function getHistory(deviceId, page = 1, limit = 100, search = "") {
  if (!deviceId) return { data: [], count: 0 }; 
  
  let url = `${BASE_URL}/history/${deviceId}?page=${page}&limit=${limit}`;
  if (search) {
      url += `&search=${encodeURIComponent(search)}`; // Mengirim kata kunci ke backend
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengambil history");
    return await response.json();
  } catch (error) {
    console.error("API ERROR (getHistory) :", error);
    return { data: [], count: 0 };
  }
}

// Mengambil status sensor terkini
async function getCurrentStatus(deviceId) {
  if (!deviceId) return null; // Proteksi jika ID kosong
  return await request(`${BASE_URL}/current/${deviceId}`);
}

// Mengambil profil perangkat
async function getDevice(deviceId) {
  if (!deviceId) return null; // Proteksi jika ID kosong
  return await request(`${BASE_URL}/device/${deviceId}`);
}

// Mengecek apakah server backend online
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/devices`);
    return response.ok;
  } catch (err) {
    return false;
  }
}

// ======================================================
// CRUD MANAJEMEN PERANGKAT
// ======================================================

async function getAllDevices() {
  const result = await request(`${BASE_URL}/devices`);
  return result || []; // Pastikan selalu mengembalikan array agar .map() tidak crash
}

async function createDevice(data) {
  try {
    const res = await fetch(`${BASE_URL}/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateDevice(id, data) {
  try {
    const res = await fetch(`${BASE_URL}/devices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteDevice(id) {
  try {
    const res = await fetch(`${BASE_URL}/devices/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ======================================================
// HELPER
// ======================================================

function formatDate(datetime) {
  if (!datetime) return "-";
  return new Date(datetime).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
