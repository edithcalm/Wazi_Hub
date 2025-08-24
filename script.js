// Toggle section visibility
document.querySelectorAll("section h3").forEach(header => {
  header.addEventListener("click", () => {
    const section = header.parentElement;
    section.classList.toggle("collapsed");
    const content = section.querySelector(".content");
    if (content) {
      content.style.display = content.style.display === "none" ? "block" : "none";
    }
  });
});

// Example: Citizen Report Form (popup alert)
const reportBtn = document.querySelector("#reportBtn");
if (reportBtn) {
  reportBtn.addEventListener("click", () => {
    alert("Citizen report submitted! Thank you for contributing to transparency.");
  });
}

// Dummy budget data for 47 counties
const budgetData = [
  { county: "Nairobi", planned: 12000000000, actual: 11000000000 },
  { county: "Mombasa", planned: 8000000000, actual: 7200000000 },
  { county: "Kisumu", planned: 6000000000, actual: 5800000000 },
  { county: "Nakuru", planned: 7000000000, actual: 6400000000 },
  { county: "Kiambu", planned: 7500000000, actual: 7100000000 },
  { county: "Machakos", planned: 5000000000, actual: 4700000000 },
  { county: "Uasin Gishu", planned: 5500000000, actual: 5200000000 },
  { county: "Kakamega", planned: 5200000000, actual: 4800000000 },
  { county: "Kericho", planned: 3000000000, actual: 2800000000 },
  { county: "Kisii", planned: 4000000000, actual: 3900000000 },
  { county: "Bungoma", planned: 4800000000, actual: 4600000000 },
  { county: "Trans Nzoia", planned: 3500000000, actual: 3300000000 },
  { county: "Nyeri", planned: 2900000000, actual: 2700000000 },
  { county: "Murang’a", planned: 3100000000, actual: 3000000000 },
  { county: "Embu", planned: 2700000000, actual: 2500000000 },
  { county: "Meru", planned: 4300000000, actual: 4000000000 },
  { county: "Tharaka-Nithi", planned: 2200000000, actual: 2000000000 },
  { county: "Laikipia", planned: 2400000000, actual: 2100000000 },
  { county: "Narok", planned: 3700000000, actual: 3400000000 },
  { county: "Kajiado", planned: 3200000000, actual: 3000000000 },
  { county: "Turkana", planned: 6000000000, actual: 5500000000 },
  { county: "West Pokot", planned: 2300000000, actual: 2100000000 },
  { county: "Elgeyo-Marakwet", planned: 2100000000, actual: 1900000000 },
  { county: "Baringo", planned: 2800000000, actual: 2500000000 },
  { county: "Samburu", planned: 2000000000, actual: 1800000000 },
  { county: "Marsabit", planned: 3500000000, actual: 3100000000 },
  { county: "Isiolo", planned: 1800000000, actual: 1600000000 },
  { county: "Garissa", planned: 2700000000, actual: 2400000000 },
  { county: "Wajir", planned: 3000000000, actual: 2700000000 },
  { county: "Mandera", planned: 3300000000, actual: 3000000000 },
  { county: "Tana River", planned: 1900000000, actual: 1700000000 },
  { county: "Lamu", planned: 1500000000, actual: 1300000000 },
  { county: "Kilifi", planned: 4200000000, actual: 3900000000 },
  { county: "Kwale", planned: 3100000000, actual: 2800000000 },
  { county: "Taita-Taveta", planned: 2000000000, actual: 1800000000 },
  { county: "Kitui", planned: 3500000000, actual: 3200000000 },
  { county: "Makueni", planned: 2900000000, actual: 2700000000 },
  { county: "Nyandarua", planned: 2600000000, actual: 2400000000 },
  { county: "Nandi", planned: 3000000000, actual: 2800000000 },
  { county: "Vihiga", planned: 2100000000, actual: 1900000000 },
  { county: "Siaya", planned: 2800000000, actual: 2600000000 },
  { county: "Homa Bay", planned: 3300000000, actual: 3100000000 },
  { county: "Migori", planned: 3100000000, actual: 2900000000 },
  { county: "Busia", planned: 2600000000, actual: 2400000000 },
  { county: "Nyamira", planned: 2300000000, actual: 2100000000 },
  { county: "Bomet", planned: 2700000000, actual: 2500000000 }
];

// Load data into table
function loadBudgetData() {
  const tbody = document.querySelector("#budgetTable tbody");
  tbody.innerHTML = "";

  budgetData.forEach(item => {
    const variance = item.actual - item.planned;
    const row = `
      <tr>
        <td>${item.county}</td>
        <td>${item.planned.toLocaleString()}</td>
        <td>${item.actual.toLocaleString()}</td>
        <td style="color:${variance < 0 ? 'red' : 'green'};">
          ${variance.toLocaleString()}
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Render chart
function renderBudgetChart() {
  const ctx = document.getElementById("budgetChart").getContext("2d");

  const counties = budgetData.map(item => item.county);
  const planned = budgetData.map(item => item.planned);
  const actual = budgetData.map(item => item.actual);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: counties,
      datasets: [
        {
          label: "Planned (KES)",
          data: planned,
          backgroundColor: "rgba(0, 100, 0, 0.7)", // green
        },
        {
          label: "Actual (KES)",
          data: actual,
          backgroundColor: "rgba(178, 34, 34, 0.7)", // red
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => value.toLocaleString()
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: "County Planned vs Actual Spending (KES)",
          font: { size: 18 }
        },
        legend: { position: "top" }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadBudgetData();
  renderBudgetChart();
});
