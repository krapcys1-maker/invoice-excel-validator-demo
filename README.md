# Invoice Excel Validator Demo

Static browser tool showing an invoice automation pattern:

```text
synthetic invoice text -> field extraction -> validation checks -> Excel-style output
```

## Safety

This demo uses synthetic data only. No company data, client data or confidential workflows are included.

## Run locally

Open `index.html` in a browser, or run:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Live demo

https://krapcys1-maker.github.io/invoice-excel-validator-demo/

## What it demonstrates

- document intelligence workflow,
- editable synthetic invoice input,
- invoice field normalization,
- deterministic validation checks,
- configurable VAT rate from input,
- warning count for review work,
- copy/export of the Excel-style row,
- clean Excel-style output,
- review queue for missing references.

## Synthetic rules

- Duplicate detection uses a small synthetic blocked list: `INV-0201`, `INV-0218`, `INV-0242`.
- VAT is calculated from the `VAT Rate` line in the input.
- Missing PO numbers are treated as review warnings, not hard failures.

## Limitations

- Uses synthetic invoice text only.
- Does not parse real PDFs or scanned documents.
- Does not support multi-line invoice tables, multiple VAT rates or multiple currencies.
- Runs entirely in the browser with vanilla HTML, CSS and JavaScript.
- Validation rules are deterministic demo logic, not a production finance control system.

## Future improvements

- Add CSV/XLSX export for batches of synthetic invoices.
- Add real PDF text extraction in a backend version.
- Support multiple VAT rates and line-item validation.
- Add configurable duplicate lists and PO master-data checks.
- Produce an audit report for every warning and validation decision.
