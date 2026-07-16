// =======================================
// SMART TRASH BIN NOTIFICATION
// =======================================

// Status sebelumnya
let lastTrashStatus = "";
let lastServerStatus = true; // Defaultnya dianggap online

// =======================================
// Membuat Toast
// =======================================

function showToast(title, message, type = "info") {
  const container = document.getElementById("toast-container");

  if (!container) return;

  const toast = document.createElement("div");

  toast.className = `toast ${type}`;

  toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// =======================================
// Notifikasi Sampah
// =======================================

function checkTrashNotification(statusSampah) {
  if (statusSampah === lastTrashStatus) return;

  lastTrashStatus = statusSampah;

  switch (statusSampah) {
    case "Penuh":
      showToast(
        "⚠ Tong Sampah Penuh",
        "Segera kosongkan tong sampah.",
        "danger",
      );
      break;

    case "Sedang":
      showToast(
        "📦 Tong Sampah Terisi",
        "Kapasitas tong sampah mulai bertambah.",
        "warning",
      );
      break;

    case "Sedikit":
      showToast(
        "✅ Tong Sampah Kosong",
        "Tong sampah dalam kondisi normal.",
        "success",
      );
      break;
  }
}

// =======================================
// Status Server
// =======================================

function checkServerNotification(isOnline) {
  // Jika status sama dengan sebelumnya, tidak perlu kirim notifikasi lagi
  if (isOnline === lastServerStatus) return;

  lastServerStatus = isOnline;

  if (isOnline) {
    showToast(
      "🌐 Server Online",
      "Koneksi ke server telah terhubung kembali.",
      "success",
    );
  } else {
    showToast(
      "⚠️ Server Offline",
      "Gagal terhubung ke server. Periksa koneksi internet.",
      "danger",
    );
  }
}

// =======================================
// Notifikasi Heartbeat
// =======================================

function showHeartbeat() {
  showToast("💓 Heartbeat", "ESP32 masih aktif.", "info");
}

// =======================================
// Notifikasi Data Baru
// =======================================

function showDataUpdated() {
  showToast(
    "🔄 Data Diperbarui",
    "Dashboard telah menerima data terbaru.",
    "info",
  );
}
