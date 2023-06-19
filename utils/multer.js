// const multer = require('multer');
// const {v4: uuidv4} = require('uuid');

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null,'./uploads/')
//     },
//     filename: function(req, file, cb) {
//         const fileName = `${uuidv4()}-${file.originalname}`;
//         cb(null, fileName);
//     }
// })

// const fileFilter = (req, file, cb) => {
//     if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
//         cb(null, true)
//     }else {
//         cb({message: 'Unsupported file format'}, false);
//     }
// }

// // const upload = multer({
// //     storage: storage,
// //     limits: {fileSize: 1024 * 1024},
// //     fileFilter: fileFilter
// // });
// module.exports = multer({
//     storage: storage,
//     limits: {fileSize: 1024 * 1024},
//     fileFilter: fileFilter
// });

// module.exports = upload;

const multer = require('multer');

module.exports = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 500000 }
});