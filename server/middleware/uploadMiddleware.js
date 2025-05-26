import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Add timestamp to ensure unique filenames
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Check if it's a video upload
  if (file.fieldname === "video") {
    const videoFiletypes = /mp4|webm|quicktime|mov/;
    const videoExtname = videoFiletypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const videoMimetype =
      /video\/mp4|video\/webm|video\/quicktime|video\/mov|video\/x-quicktime/.test(
        file.mimetype
      );

    console.log("Video file check:", {
      originalName: file.originalname,
      mimetype: file.mimetype,
      extname: path.extname(file.originalname).toLowerCase(),
      videoExtname,
      videoMimetype,
    });

    if (videoExtname && videoMimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Videos only! Please upload a video file (mp4, webm, quicktime)"
        )
      );
    }
  } else {
    // For image uploads
    const imageFiletypes = /jpeg|jpg|png|webp/;
    const imageExtname = imageFiletypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const imageMimetype = /image\/jpeg|image\/jpg|image\/png|image\/webp/.test(
      file.mimetype
    );

    if (imageExtname && imageMimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Images only! Please upload an image file (jpeg, jpg, png, webp)"
        )
      );
    }
  }
};

// Create separate upload instances for images and videos
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter,
});

// For backward compatibility
const upload = imageUpload;

export { upload, imageUpload, videoUpload };
