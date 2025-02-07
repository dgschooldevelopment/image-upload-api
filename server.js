const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Base directory for storing images
const BASE_DIR = "/home/root/MGVP";

// Ensure the base directory exists
if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
}

// Multer storage configuration (Dynamic Directory Selection)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.query.folder; // Get folder from query parameter

        if (!folder) {
            return cb(new Error("Folder query parameter is required"), null);
        }

        const uploadPath = path.join(BASE_DIR, folder);

        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep original filename
    },
});

const upload = multer({ storage });

// API to upload an image to a user-specified folder
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const folder = req.query.folder;
    if (!folder) {
        return res.status(400).json({ error: "Folder query parameter is required" });
    }

    const imageUrl = `http://195.35.45.44/images/${folder}/${req.file.originalname}`;

    res.json({
        message: "Image uploaded successfully",
        uploaded_to: folder,
        imageUrl: imageUrl,
    });
});

// Serve images dynamically from any folder
app.use("/images", express.static(BASE_DIR));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
