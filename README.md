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
- clean Excel-style output,
- review queue for missing references.
