const machine = document.querySelector("#machine");
const runBtn = document.querySelector("#runBtn");
const invoiceInput = document.querySelector("#invoiceInput");

function money(value, decimals = 2) {
  return `€${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

function parseMoney(raw) {
  return Number(String(raw || "").replace(/[^0-9.,-]/g, "").replace(/,/g, ""));
}

function valueFor(text, label) {
  const match = text.match(new RegExp(`${label}\\s*:\\s*(.+)`, "i"));
  return match ? match[1].trim() : "";
}

function parseInvoice(text) {
  return {
    invoiceNo: valueFor(text, "Invoice No"),
    date: valueFor(text, "Date"),
    customer: valueFor(text, "Customer"),
    net: parseMoney(valueFor(text, "Net")),
    vat: parseMoney(valueFor(text, "VAT")),
    total: parseMoney(valueFor(text, "Total")),
    po: valueFor(text, "PO")
  };
}

function renderInvoice() {
  const invoice = parseInvoice(invoiceInput.value);
  const expectedVat = Math.round(invoice.net * 0.19 * 100) / 100;
  const expectedTotal = Math.round((invoice.net + invoice.vat) * 100) / 100;
  const checks = {
    vat: Math.abs(invoice.vat - expectedVat) < 0.01,
    total: Math.abs(invoice.total - expectedTotal) < 0.01,
    duplicate: !["INV-0201", "INV-0218", "INV-0242"].includes(invoice.invoiceNo),
    po: Boolean(invoice.po)
  };

  for (const [key, value] of Object.entries(invoice)) {
    const target = document.querySelector(`[data-field="${key}"]`);
    if (!target) continue;
    target.textContent = ["net", "vat", "total"].includes(key) ? money(value) : value || "Missing";
  }

  const copy = {
    vat: `VAT calculation: ${checks.vat ? "OK" : `Mismatch, expected ${money(expectedVat)}`}`,
    total: `Total match: ${checks.total ? "OK" : `Mismatch, expected ${money(expectedTotal)}`}`,
    duplicate: `Duplicate invoice: ${checks.duplicate ? "No duplicate" : "Duplicate found"}`,
    po: `Missing PO number: ${checks.po ? "OK" : "Review"}`
  };

  for (const [key, text] of Object.entries(copy)) {
    const target = document.querySelector(`[data-check="${key}"]`);
    target.textContent = `${checks[key] ? "✓" : "!"} ${text}`;
    target.classList.toggle("warn", !checks[key]);
  }

  document.querySelector('[data-output="invoiceNo"]').textContent = invoice.invoiceNo || "Missing";
  document.querySelector('[data-output="net"]').textContent = money(invoice.net, 0);
  document.querySelector('[data-output="vat"]').textContent = money(invoice.vat);
  document.querySelector('[data-output="status"]').textContent = Object.values(checks).every(Boolean) ? "Clean" : "Review";
}

function runDemo() {
  renderInvoice();
  const items = [...machine.querySelectorAll("[data-step]")];
  items.forEach((item) => item.classList.remove("active"));
  items.forEach((item, index) => {
    window.setTimeout(() => item.classList.add("active"), 300 + index * 520);
  });
}

runBtn.addEventListener("click", runDemo);
runDemo();
