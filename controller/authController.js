const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appErrors');

exports.signup = catchAsync(async (req,res,next) => {
    //const newUser = await User.create(req.body);  anyone can signup as admin
    const newUser = await User.create({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });

    // const token = jwt.sign({id:newUser._id}, process.env.JWT_SECRET,
    //                        {expiresIn:process.env.JWT_EXPIRES_IN} );

    res.status(201).json({
        status:'success',
        //token:token,
        data:{
            user:newUser
        }
    })
});

exports.login = catchAsync((req,res,next) => {
    const{email,password} = req.body;
    //check if email,password exist
    if (!email || ! password){
       return new AppError('provide email and password',400)
    }
    // check if user exist and password is correct
    const user = User.findOne({email}).select(+password)
    // if everything ok sent token to client
    const token = ''
    res.status(200).json({
        status:success,
        token
    })
});