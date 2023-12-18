const User = require('./../models/userModel');
const {promisify} = require('util');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appErrors');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = id => {
     return jwt.sign({id}, process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRES_IN} 
    )
};

const createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id);
    console.log('JWT_COOKIE_EXPIRES_IN',process.env.JWT_COOKIE_EXPIRES_IN)
    console.log(process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
    const cookieOptions = {expires:new Date(Date.now() +
                           process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
                           httpOnly:true};
    if (process.env.NODE_ENV==='production') cookieOptions.secure = true
    res.cookie('jwt',token,cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status:'success',
        token,
        data: user
    })
};

exports.signup = catchAsync(async (req,res,next) => {
    //const newUser = await User.create(req.body);  anyone can signup as admin
    const newUser = await User.create({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        role:req.body.role
    });

    createSendToken(newUser,201,res)
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

exports.resetPassword = catchAsync(async (req,res,next) => {
        // 1) Get user based on the token
         const hashToken = crypto.createHash('sha256')
                                 .update(req.params.token)
                                 .digest('hex');

        const user = await User.findOne({passwordResetToken:hashToken,
                                         passwordResetExpires:{$gt: Date.now()}})
        // 2) If token has not expired, and there is user, set the new password
        if (!user) {return next(new AppError('Token is invalid or has expired',400))};
        user.password = req.body.password,
        user.passwordConfirm = req.body.passwordConfirm,
        user.passwordResetToken = undefined,
        user.passwordResetExpires = undefined
        await user.save()
        // 3) Update change password property for the user
        // 4) Log the user, send the jwt
        const token = signToken(user._id)
        res.status(200).json({
            status:'success',
            message:'successfully logged-in',
            token
        })
});

exports.updatePassword = catchAsync(async (req,res,next) => {
    const {currentpassword,newpassword,confirmnewpassword} = req.body;
    const id = req.user.id
    const user = await User.findById(id).select('+password');
    
    if (!(await user.correctPassword(currentpassword,user.password))){
        return next(new AppError('your current password is wrong...',401))
    }
    user.password = newpassword;
    user.passwordConfirm = confirmnewpassword;
    await user.save();
    const token = signToken(user._id)
        res.status(200).json({
            status:'success',
            message:'changed password successfully,you are logged-in now',
            token
        })
})






