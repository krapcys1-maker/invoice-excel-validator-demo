const machine = document.querySelector("#machine");
const runBtn = document.querySelector("#runBtn");

function runDemo() {
  const items = [...machine.querySelectorAll("[data-step]")];
  items.forEach((item) => item.classList.remove("active"));
  items.forEach((item, index) => {
    window.setTimeout(() => item.classList.add("active"), 300 + index * 520);
  });
}

runBtn.addEventListener("click", runDemo);
runDemo();
