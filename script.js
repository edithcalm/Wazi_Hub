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
