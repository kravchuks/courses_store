const multer = require("multer"); //import multer

const storage = multer.diskStorage({
  //create storage for multer
  destination(req, file, cb) {
    //create destination for files
    cb(null, "images"); //null - no error, 'images' - folder for files
  },
  filename(req, file, cb) {
    //create filename for files
    cb(null, new Date().toISOString() + "-" + file.originalname); //null - no error, new Date().toISOString() - date for filename, file.originalname - original name of file
  },
});

const allowedTypes = ["image/png", "image/jpg", "image/jpeg"]; //create array with allowed types of files

const fileFilter = (req, file, cb) => {
  //create filter for files
  if (allowedTypes.includes(file.mimetype)) {
    //if file is image
    cb(null, true); //null - no error, true - accept file
  } else {
    cb(null, false); //null - no error, false - reject file
  }
};

module.exports = multer({
  //export multer
  storage: storage, //storage for multer
  fileFilter: fileFilter, //filter for multer
});
