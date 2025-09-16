# Print Daemon (Windows, Silent PDF Printing)

A minimal HTTP daemon that accepts a PDF upload and prints it silently to the **default printer** on Windows using an embedded **SumatraPDF.exe**.

## Features
- `POST /print` with a `multipart/form-data` file field named **file**
- Silently prints via SumatraPDF with `-print-to-default -silent`
- Packed to a single EXE using [`pkg`](https://github.com/vercel/pkg)
- Auto-extracts bundled `bin/SumatraPDF.exe` at runtime

## Quick Start (Dev)
```bash
npm i
npm run start
# -> http://localhost:9000
