// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");

// const app = express();
// const PORT = 5001;

// // Enable CORS
// app.use(cors());

// // Base directory for storing images
// const BASE_DIR = "/home/root/MGVP";

// // Ensure the base directory exists
// if (!fs.existsSync(BASE_DIR)) {
//     fs.mkdirSync(BASE_DIR, { recursive: true });
// }

// // Multer storage configuration (Dynamic Directory Selection)
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const folder = req.query.folder; // Get folder from query parameter

//         if (!folder) {
//             return cb(new Error("Folder query parameter is required"), null);
//         }

//         const uploadPath = path.join(BASE_DIR, folder);

//         // Ensure the directory exists
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }

//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname); // Keep original filename
//     },
// });

// const upload = multer({ storage });

// // API to upload an image to a user-specified folder
// app.post("/upload", upload.single("image"), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//     }

//     const folder = req.query.folder;
//     if (!folder) {
//         return res.status(400).json({ error: "Folder query parameter is required" });
//     }

//     const imageUrl = `http://195.35.45.44/images/${folder}/${req.file.originalname}`;

//     res.json({
//         message: "Image uploaded successfully",
//         uploaded_to: folder,
//         imageUrl: imageUrl,
//     });
// });

// // Serve images dynamically from any folder
// app.use("/images", express.static(BASE_DIR));

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server running on http://0.0.0.0:${PORT}`);
// });

// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");
// const os = require("os");

// // ✅ Jimp import
// const jimpImport = require("jimp");
// const Jimp = jimpImport.default || jimpImport;

// const app = express();
// const PORT = 5001;
// const BASE_DIR = "/home/root/MGVP";

// // ✅ CORS enabled
// app.use(cors());

// // ✅ Serve all existing images
// app.use("/images", express.static(BASE_DIR));

// // ✅ Ensure BASE_DIR exists
// if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

// // ✅ Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const folder = req.query.folder || "default";
//     const uploadPath = path.join(BASE_DIR, folder);
//     if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, path.basename(file.originalname));
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowed = /jpeg|jpg|png|gif/;
//     const extname = allowed.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowed.test(file.mimetype);
//     extname && mimetype ? cb(null, true) : cb(new Error("Only image files are allowed"));
//   },
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// }); 

// // // ✅ Utility: Get local IP
// // function getLocalIP() {
// //   const interfaces = os.networkInterfaces();
// //   for (let iface in interfaces) {
// //     for (let alias of interfaces[iface]) {
// //       if (alias.family === "IPv4" && !alias.internal) return alias.address;
// //     }
// //   }
// //   return "localhost";
// // }

// // ✅ Image Upload + Compression
// app.post("/upload", upload.single("image"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   const folder = req.query.folder || "default";
//   const filename = path.basename(req.file.originalname);
//   const uploadDir = path.join(BASE_DIR, folder);

//   try {
//     const image = await Jimp.read(req.file.path);
//     const { width, height } = image.bitmap;

//     const compressedBuffer = await image
//       .clone()
//       .resize(width * 0.8, height * 0.8, Jimp.RESIZE_BEZIER)
//       .quality(90)
//       .getBufferAsync(Jimp.MIME_JPEG);

//     const compressedName = `compressed_${Date.now()}.jpg`;
//     const compressedPath = path.join(uploadDir, compressedName);

//     fs.writeFileSync(compressedPath, compressedBuffer);

//     // Optional: delete original uploaded image
//     fs.unlinkSync(req.file.path);

//     const serverURL = `http://195.35.45.44:5001`;
//     res.json({
//       message: "Compressed image saved successfully",
//       compressedImageURL: `${serverURL}/images/${folder}/${compressedName}`,
//       recreateURL: `${serverURL}/recreate/${folder}/${compressedName}`,
//     });

//   } catch (err) {
//     console.error("❌ Compression error:", err);
//     res.status(500).json({ error: "Processing failed", details: err.message });
//   }
// });

// // ✅ Recreate Route: restore original size
// app.get("/recreate/:folder/:filename", async (req, res) => {
//   const { folder, filename } = req.params;
//   const imagePath = path.join(BASE_DIR, folder, filename);

//   if (!fs.existsSync(imagePath)) {
//     return res.status(404).send("Image not found");
//   }

//   try {
//     const image = await Jimp.read(imagePath);
//     const { width, height } = image.bitmap;
//     const ext = path.extname(filename).toLowerCase();

//     let mimeType = Jimp.MIME_JPEG;
//     if (ext === ".png") mimeType = Jimp.MIME_PNG;
//     else if (ext === ".bmp") mimeType = Jimp.MIME_BMP;
//     else if (ext === ".gif") mimeType = Jimp.MIME_GIF;

//     const recreated = await image
//       .clone()
//       .resize(width / 0.8, height / 0.8, Jimp.RESIZE_BEZIER)
//       .quality(100)
//       .getBufferAsync(mimeType);

//     res.set("Content-Type", mimeType);
//     res.send(recreated);
//   } catch (err) {
//     console.error("❌ Recreate error:", err);
//     res.status(500).send("Error recreating image");
//   }
// });

// // ✅ Server Start
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`✅ Server running at: http://195.35.45.44:5001`);
// });


const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const JimpImport = require("jimp");
const Jimp = JimpImport.default || JimpImport;

const app = express();
const PORT = 5001;

// ✅ Enable CORS
app.use(cors());

// ✅ Base directory
const BASE_DIR = "/home/root/MGVP";

// ✅ Ensure base directory exists
if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
}

// ✅ Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.query.folder;
        if (!folder) {
            return cb(new Error("Folder query parameter is required"), null);
        }
        const uploadPath = path.join(BASE_DIR, folder);
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

// ✅ Upload endpoint
app.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const folder = req.query.folder;
    if (!folder) {
        return res.status(400).json({ error: "Folder query parameter is required" });
    }

    const filePath = path.join(BASE_DIR, folder, req.file.originalname);

    // ✅ If it's an image, compress it
    const ext = path.extname(req.file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        try {
            const image = await Jimp.read(filePath);
            const { width, height } = image.bitmap;

            await image
                .resize(width * 0.8, height * 0.8, Jimp.RESIZE_BEZIER)
                .quality(90)
                .writeAsync(filePath);

        } catch (err) {
            console.error("Image compression failed:", err.message);
            return res.status(500).json({ error: "Image compression failed", details: err.message });
        }
    }

    const fileUrl = `http://195.35.45.44:5001/images/${folder}/${req.file.originalname}`;
    res.json({
        message: "File uploaded successfully",
        uploaded_to: folder,
        fileUrl: fileUrl,
    });
});

// ✅ Serve files statically
app.use("/images", express.static(BASE_DIR));

// ✅ Recreate original quality image
app.get("/recreate/:folder/:filename", async (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(BASE_DIR, folder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    const ext = path.extname(filename).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
        return res.status(400).json({ error: "Only images can be recreated" });
    }

    try {
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;

        await image
            .resize(width / 0.8, height / 0.8, Jimp.RESIZE_BEZIER)
            .quality(100)
            .writeAsync(filePath);

        const recreatedUrl = `http://195.35.45.44:5001/images/${folder}/${filename}`;
        res.json({
            message: "Image recreated successfully",
            imageUrl: recreatedUrl,
        });

    } catch (err) {
        console.error("Image recreation failed:", err.message);
        return res.status(500).json({ error: "Image recreation failed", details: err.message });
    }
});

// ✅ Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at: http://195.35.45.44:5001`);
});


