const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErrors');

exports.getAllUsers = catchAsync(async (req,res,next) => {
    // EXECUTE QUERY
    const users = await User.find();
    res.status(200).json({
        status:'success',
        data:{
            users:users
        }        // middle ware
    })
});

exports.getUser = catchAsync( async (req,res) => {
    const id = req.params.id 
    const findUser = await User.findById(req.params.id)
    if (!User){
        return next(AppError('This Id is not exist'))
    }
    res.status(200).json({
        status:'success',
        data: findUser
    })
});

// exports.createUser = catchAsync(async(req,res) => {
//     const newUser = User.create(req.body)
//     res.status(200).json({
//         status:'success',
//         data: newUser
//     })
// });

exports.updateUser = catchAsync(async(req,res) => {
    const updateUser = await User
        .findByIdAndUpdate(req.params.id,req.body);

    res.status(200).json({
    status:'success',
    data: updateUser
    })
});

exports.deleteUser = catchAsync(async(req,res) => {
    const deleteId = req.params.id;
    await User.findByIdAndDelete(deleteId)
    res.status(200).json({
        status:'error',
        message:'Successfully deleted document.'
    })
});

