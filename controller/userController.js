const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErrors');

const userFilter = (bodyObj,...allowFields) => {
    let filterObj = {};
    Object.keys(bodyObj).forEach(el => {
        if (allowFields.includes(el)){
           filterObj[el] = bodyObj[el]
        }
    })
    return filterObj
}
exports.getAllUsers = catchAsync(async (req,res,next) => {
    // EXECUTE QUERY
    const users = await User.find()
    console.log(users)
    res.status(200).json({
        status:'success',
        length:users.length,
        data:{
            user_data: users
        }     
    })
});

exports.getUser = catchAsync( async (req,res) => {
    const id = req.params.id 
    const findUser = await User.findById(req.params.id)
    if (!User){
        return next(AppError('This Id is not exist',404))
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

exports.updateUser = catchAsync(async(req,res,next) => {
    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError('password change is not allowed on this route',400))
    };
    const filterBody = userFilter(req.body,'name','email')
    const updateUser = await User
        .findByIdAndUpdate(req.user.id,filterBody,{new:true,runValidators:true});

    

    res.status(200).json({
    status:'success',
    data: updateUser
    })
});

exports.deleteUser = catchAsync(async(req,res,next) => {
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status(204).json({
        status:'success',
        message:'Successfully deleted document.'
    })
});

