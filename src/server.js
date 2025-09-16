const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const child_process = require("child_process");

// ================== Constants ==================
const BIN_NAME = "SumatraPDF.exe";
const PORT = process.env.PORT || 9000;

// ================== Resolve paths ==================
const BIN_SOURCE = path.join(path.dirname(process.execPath), "bin", BIN_NAME); // works with pkg
const BIN_DEST = path.join(os.tmpdir(), BIN_NAME);

// ================== Extract SumatraPDF from pkg fs ==================
if (!fs.existsSync(BIN_DEST)) {
  try {
    const data = fs.readFileSync(BIN_SOURCE);
    fs.writeFileSync(BIN_DEST, data);
    console.log(`✅ Extracted SumatraPDF to: ${BIN_DEST}`);
  } catch (err) {
    console.error("❌ Failed to extract SumatraPDF:", err);
    process.exit(1);
  }
}

// ================== Ensure uploads dir ==================
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });
const app = express();

// Health check
app.get("/healthz", (_, res) => res.json({ ok: true }));

// ================== Print Endpoint ==================
app.post("/print", upload.single("file"), async (req, res) => {
  try {
    if (!req.file?.path) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.resolve(req.file.path);
    const args = [
      "-print-to-default",
      "-silent",
      "-print-settings",
      "noscale",
      filePath
    ];

    console.log("▶ Running:", BIN_DEST, args.join(" "));

    const child = child_process.spawn(BIN_DEST, args, { shell: false });

    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (err) => {
      console.error("❌ Failed to start SumatraPDF:", err);
      return res.status(500).json({ error: err.message });
    });

    child.on("exit", (code) => {
      fs.unlink(filePath, (err) => {
        if (err) console.warn("⚠️ Could not delete file:", err);
      });

      if (code === 0) {
        console.log(`✅ Print job completed: ${filePath}`);
        return res.json({ success: true });
      }

      console.error(`❌ SumatraPDF exited with code ${code} ${stderr ? `stderr: ${stderr}` : ""}`);
      return res.status(500).json({ error: `SumatraPDF exited with code ${code}` });
    });
  } catch (err) {
    console.error("❌ Print error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ================== Start ==================
app.listen(PORT, () => {
  console.log("=======================================");
  console.log(" 🖨️  Print Daemon running");
  console.log(` 🌐  Listening at http://localhost:${PORT}`);
  console.log(" 📄  POST PDFs to /print to print silently");
  console.log("=======================================");
});
