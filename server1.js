const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS for frontend access
app.use(cors());

// Directory where images will be stored
const UPLOADS_DIR = "/home/root/MGVP/homework_pending";

// Ensure the directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration (Keep original filename)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep original filename
    },
});

const upload = multer({ storage });

// API to upload an image
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // URL to access the uploaded image
    const imageUrl = `http://195.35.45.44/images/${req.file.originalname}`;
    res.json({ message: "Image uploaded successfully", imageUrl });
});

// Serve images statically
app.use("/images", express.static(UPLOADS_DIR));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
