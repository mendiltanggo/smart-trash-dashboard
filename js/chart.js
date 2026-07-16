// ===============================
// Smart Trash Bin Chart
// ===============================
let trashChart = null;

// Membuat grafik pertama kali
function initChart() {
  const ctx = document.getElementById("trashChart").getContext("2d");
  trashChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Persentase Sampah (%)",
          data: [],
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderColor: "#00c853",
          backgroundColor: "rgba(0,200,83,0.15)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 700,
      },
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });
}

// ===============================
// Update Chart
// ===============================
function updateChart(logs) {
  // Validasi: pastikan chart sudah terinisialisasi dan data logs adalah Array
  if (!trashChart || !Array.isArray(logs)) return;

  const labels = [];
  const values = [];

  // Ambil maksimal 15 data terbaru dari riwayat agar grafik tidak terlalu padat
  // Gunakan spread operator [...] agar tidak mengubah array aslinya saat direverse
  const latestLogs = [...logs].slice(0, 15).reverse();

  latestLogs.forEach((item) => {
    const waktu = new Date(item.created_at);
    // Format waktu menjadi HH:MM saja agar lebih rapi di sumbu X
    labels.push(
      waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    );
    values.push(item.persentase);
  });

  // Render ulang data ke dalam chart
  trashChart.data.labels = labels;
  trashChart.data.datasets[0].data = values;
  trashChart.update();
}
