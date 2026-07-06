# Invoice Excel Validator Demo

Static portfolio demo showing an invoice automation pattern:

```text
synthetic invoice -> field extraction -> validation checks -> Excel-style output
```

## Safety

This demo uses synthetic data only. No company data, client data or confidential workflows are included.

## Run locally

Open `index.html` in a browser, or run:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## What it demonstrates

- document intelligence workflow,
- invoice field normalization,
- deterministic validation checks,
- clean Excel-style output,
- review queue for missing references.
