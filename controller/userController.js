const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErrors');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//     cb(null, 'public/img/users')},
//     filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    console.log('in upload middleware')
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
      });

const userFilter = (bodyObj,...allowFields) => {
    let filterObj = {};
    Object.keys(bodyObj).forEach(el => {
        if (allowFields.includes(el)){
           filterObj[el] = bodyObj[el]
        }
    })
    return filterObj
};

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    console.log('in resizeimage middleware')
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);
    next();
  });

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
  };

exports.createUser = (req, res) => {
    res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
    });
  };

exports.updateMe = catchAsync(async(req,res,next) => {
    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError('password change is not allowed on this route',400))
    };
    console.log(req.body)
    const filterBody = userFilter(req.body,'name','email','photo')
    if (req.file) filterBody.photo = req.file.filename;
    const updateUser = await User
        .findByIdAndUpdate(req.user.id,filterBody,{new:true,runValidators:true});

    res.status(200).json({
    status:'success',
    data: updateUser
    })
});

exports.deleteMe = catchAsync(async(req,res,next) => {
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status(204).json({
        status:'success',
        message:'Successfully deleted document.'
    })
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// exports.getAllUsers = catchAsync(async (req,res,next) => {
//     // EXECUTE QUERY
//     const users = await User.find()
//     console.log(users)
//     res.status(200).json({
//         status:'success',
//         length:users.length,
//         data:{
//             user_data: users
//         }     
//     })
// });

// exports.getUser = catchAsync( async (req,res) => {
//     const id = req.params.id 
//     const findUser = await User.findById(req.params.id)
//     if (!User){
//         return next(AppError('This Id is not exist',404))
//     }
//     res.status(200).json({
//         status:'success',
//         data: findUser
//     })
// });

// exports.createUser = catchAsync(async(req,res) => {
//     const newUser = User.create(req.body)
//     res.status(200).json({
//         status:'success',
//         data: newUser
//     })
// });
