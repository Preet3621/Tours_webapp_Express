const User = require('./../models/userModel');
const {promisify} = require('util');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appErrors');
const sendEmail = require('./../utils/email');

const signToken = id => {
     return jwt.sign({id}, process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRES_IN} 
    )
};

exports.signup = catchAsync(async (req,res,next) => {
    //const newUser = await User.create(req.body);  anyone can signup as admin
    const newUser = await User.create({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });

    const token = signToken(newUser._id)

    res.status(201).json({
        status:'success',
        token:token,
        data:{
            user:newUser
        }
    })
});

exports.login = async(req,res,next) => {
    const{email,password} = req.body;
    //check if email,password exist
    if (!email || !password){
       return next(new AppError('provide email and password',400))
    }
    // check if user exist and password is correct
    const user = await User.findOne({email}).select('+password');
    
    if (!user || !(await user.correctPassword(password,user.password))){
        console.log('fatal error')
        return next(new AppError('incorrect email or password',401))
    }
    // if everything ok sent token to client
    const token = signToken(user._id)
    res.status(200).json({
        status:'success',
        message:'successfully logged-in',
        token
    })
};

exports.protect = catchAsync(async(req,res,next) => {
    // 1) Getting token and check if it is there
    let token;
    if(req.headers.authorization &&
       req.headers.authorization.startsWith('Bearer')){
       token = req.headers.authorization.split(' ')[1];
       console.log(token)
    };

    if(!token){
        return next(new AppError('you are not logged-in please login to get access',401));
    }
    // 2) verification token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    console.log(decoded)

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser){
        return next(new AppError('The user belonging to this token does no longer exist',401))
    }
    console.log("printing currentUser")
    console.log(currentUser)
    // 4) check if user change the password after token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next (new AppError('User recently changed the password please login again',401))
    }
    req.user = currentUser
    next()
});

exports.restrictTo = (...roles) => {
    return(req,res,next) => {
        if(!roles.includes(req.user.role)){
            console.log('in 403')
            console.log(req.user.role)
            return next(new AppError('you are not allowed to perform this task',403))
        }
        next();
    }
};

exports.forgotPassword = catchAsync(async(req,res,next) => {
    const currentUser = await User.findOne({email:req.body.email})
    if(!currentUser){
        return next(new AppError('User with this email address does not exist',404))
    }
    console.log("printing user")
    console.log(currentUser)
    // generate random reset token
    const resetToken = currentUser.createPasswordResetToken();
    console.log(resetToken)
    await currentUser.save({validateBeforeSave:false}) 
    
    // send it to users email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`
    const message = `Forgot your password? submit a patch request with your new password and 
                     password confirm to: ${resetURL} n\ if you did not forgot your password then
                     ignore this email.`

    try {
    await sendEmail({
        email:currentUser.email,
        subject:'your password reset token, valid only for 10 minutes',
        message
    });
    res.status(200).json({
        status:'success',
        message:'message sent to the email'
    })}
    catch (err) {
        currentUser.passwordResetToken = undefined;
        currentUser.passwordResetExpires = undefined;
        await currentUser.save({validateBeforeSave:false})

        return next(new AppError('There was an error sending the email try again later!',500))
    }        
});

exports.resetPassword = (req,res,next) => {}








