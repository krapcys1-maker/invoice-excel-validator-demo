const machine = document.querySelector("#machine");
const runBtn = document.querySelector("#runBtn");
const copyBtn = document.querySelector("#copyBtn");
const exportBtn = document.querySelector("#exportBtn");
const invoiceInput = document.querySelector("#invoiceInput");
const errorBox = document.querySelector("#errorBox");
const checkSummary = document.querySelector("#checkSummary");
const copyStatus = document.querySelector("#copyStatus");

let currentInvoice = null;
let currentChecks = null;

function money(value, decimals = 2) {
  return `EUR ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

function parseMoney(raw) {
  const cleaned = String(raw || "").replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  return cleaned ? Number(cleaned) : NaN;
}

function parsePercent(raw) {
  const cleaned = String(raw || "").replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  return cleaned ? Number(cleaned) : NaN;
}

function valueFor(text, label) {
  const match = String(text || "").match(new RegExp(`^${label}\\s*:\\s*(.+)$`, "im"));
  return match ? match[1].trim() : "";
}

function parseInvoice(text) {
  return {
    invoiceNo: valueFor(text, "Invoice No"),
    date: valueFor(text, "Date"),
    customer: valueFor(text, "Customer"),
    net: parseMoney(valueFor(text, "Net")),
    vatRate: parsePercent(valueFor(text, "VAT Rate")),
    vat: parseMoney(valueFor(text, "VAT")),
    total: parseMoney(valueFor(text, "Total")),
    po: valueFor(text, "PO")
  };
}

function validateInvoice(invoice) {
  const missing = [];
  if (!invoice.invoiceNo) missing.push("Invoice No");
  if (!invoice.date) missing.push("Date");
  if (!invoice.customer) missing.push("Customer");
  if (!Number.isFinite(invoice.net) || invoice.net <= 0) missing.push("Net");
  if (!Number.isFinite(invoice.vatRate) || invoice.vatRate < 0) missing.push("VAT Rate");
  if (!Number.isFinite(invoice.vat) || invoice.vat < 0) missing.push("VAT");
  if (!Number.isFinite(invoice.total) || invoice.total <= 0) missing.push("Total");

  if (!missing.length) return "";
  return `Missing or invalid invoice fields: ${missing.join(", ")}. Use the synthetic format shown in the textarea.`;
}

function setError(message) {
  errorBox.hidden = !message;
  errorBox.textContent = message;
  machine.classList.toggle("has-error", Boolean(message));
}

function statusFor(checks) {
  return Object.values(checks).every(Boolean) ? "Clean" : "Review";
}

function csvRow(invoice, checks) {
  const cells = [
    invoice.invoiceNo,
    invoice.date,
    invoice.customer,
    invoice.net.toFixed(2),
    `${invoice.vatRate}%`,
    invoice.vat.toFixed(2),
    invoice.total.toFixed(2),
    invoice.po || "Missing",
    statusFor(checks)
  ];
  return cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",");
}

function csvOutput(invoice, checks) {
  return [
    "invoice_no,date,customer,net,vat_rate,vat,total,po,status",
    csvRow(invoice, checks)
  ].join("\n");
}

function clearOutput(message = "Run validation") {
  currentInvoice = null;
  currentChecks = null;
  document.querySelectorAll("[data-field]").forEach((target) => {
    target.textContent = "Missing";
  });
  document.querySelector('[data-output="invoiceNo"]').textContent = "Missing";
  document.querySelector('[data-output="net"]').textContent = "EUR 0";
  document.querySelector('[data-output="vat"]').textContent = "EUR 0.00";
  document.querySelector('[data-output="status"]').textContent = "Blocked";
  checkSummary.textContent = message;
  copyStatus.textContent = "";
}

function renderInvoice() {
  const invoice = parseInvoice(invoiceInput.value);
  const validationError = validateInvoice(invoice);

  if (validationError) {
    setError(validationError);
    clearOutput("0 checks passed / input blocked");
    return false;
  }

  setError("");
  copyStatus.textContent = "";

  const expectedVat = Math.round(invoice.net * (invoice.vatRate / 100) * 100) / 100;
  const expectedTotal = Math.round((invoice.net + invoice.vat) * 100) / 100;
  const duplicateInvoices = ["INV-0201", "INV-0218", "INV-0242"];
  const checks = {
    vat: Math.abs(invoice.vat - expectedVat) < 0.01,
    total: Math.abs(invoice.total - expectedTotal) < 0.01,
    duplicate: !duplicateInvoices.includes(invoice.invoiceNo),
    po: Boolean(invoice.po)
  };

  currentInvoice = invoice;
  currentChecks = checks;

  const values = {
    invoiceNo: invoice.invoiceNo,
    date: invoice.date,
    customer: invoice.customer,
    net: money(invoice.net),
    vatRate: `${invoice.vatRate}%`,
    vat: money(invoice.vat),
    total: money(invoice.total),
    po: invoice.po || "Missing"
  };

  for (const [key, value] of Object.entries(values)) {
    const target = document.querySelector(`[data-field="${key}"]`);
    if (target) target.textContent = value;
  }

  const copy = {
    vat: `VAT calculation: ${checks.vat ? "OK" : `Mismatch, expected ${money(expectedVat)}`}`,
    total: `Total match: ${checks.total ? "OK" : `Mismatch, expected ${money(expectedTotal)}`}`,
    duplicate: `Duplicate invoice: ${checks.duplicate ? "No duplicate" : "Duplicate found in synthetic rule list"}`,
    po: `PO number: ${checks.po ? "OK" : "Missing, review required"}`
  };

  for (const [key, text] of Object.entries(copy)) {
    const target = document.querySelector(`[data-check="${key}"]`);
    target.textContent = `${checks[key] ? "OK" : "!"} ${text}`;
    target.classList.toggle("warn", !checks[key]);
  }

  const passed = Object.values(checks).filter(Boolean).length;
  const warnings = Object.values(checks).length - passed;
  checkSummary.textContent = `${passed} checks passed / ${warnings} review warning${warnings === 1 ? "" : "s"}`;

  document.querySelector('[data-output="invoiceNo"]').textContent = invoice.invoiceNo;
  document.querySelector('[data-output="net"]').textContent = money(invoice.net, 0);
  document.querySelector('[data-output="vat"]').textContent = money(invoice.vat);
  document.querySelector('[data-output="status"]').textContent = statusFor(checks);

  return true;
}

async function copyExcelRow() {
  if (!renderInvoice()) return;
  const row = csvRow(currentInvoice, currentChecks);

  try {
    if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(row);
    copyStatus.textContent = "Excel row copied.";
  } catch (error) {
    const temp = document.createElement("textarea");
    temp.value = row;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
    copyStatus.textContent = "Excel row copied.";
  }
}

function exportCsv() {
  if (!renderInvoice()) return;

  const blob = new Blob([csvOutput(currentInvoice, currentChecks)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "synthetic-invoice-validation-row.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function runDemo() {
  const ok = renderInvoice();
  const items = [...machine.querySelectorAll("[data-step]")];
  items.forEach((item) => item.classList.remove("active"));
  if (!ok) return;

  items.forEach((item, index) => {
    window.setTimeout(() => item.classList.add("active"), 300 + index * 520);
  });
}

runBtn.addEventListener("click", runDemo);
copyBtn.addEventListener("click", copyExcelRow);
exportBtn.addEventListener("click", exportCsv);
runDemo();
