
const AppError = require('./../utils/appErrors');

const handleCastErrorDB = err => {
    const message = `invalid ${err.path}:${err.value}`;
    return new AppError(message,400)
};

const handleDuplicateFieldsDB = err => {
     const value = err.keyValue.name;
     console.log(value)
     const message = `Duplicate field value ${value}, please field.`
     return new AppError(message,400)
}

const handleValidationError = err => {
     const errors = Object.values(err.errors).map(el => el.message)
     const message = `Invalid input data. ${errors.join('  &  ')}`;
     return new AppError(message, 400)
}

const handleJwtError = () => {
    return new AppError('invalid token please login again',401)
};

const jwtExpiredError = () => {
    return new AppError('your token has been expired please login again',401)
};

const unAuthorizationError = () => {
  return new AppError('you are not allowed to perform this task',403)
}

const sendErrorDev = (err,req,res) => {
// A) API
if (req.originalUrl.startsWith('/api')) {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}
// B) RENDERED WEBSITE
console.error('ERROR 💥', err);
return res.status(err.statusCode).render('error', {
  title: 'Something went wrong!',
  msg: err.message
});
};

const sendErrorProd = (err,req,res) => {
    // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

// module.exports = (err,req,res,next) =>{
//     //console.log(err.stack);
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     if (process.env.NODE_ENV == 'development') {
//        let error = {...err}; 
//        console.log(error)
//        error.message = err.message

//         sendErrorDev(error,req,res)
//         next()
//     } 
//     else if(process.env.NODE_ENV == 'production') {
//       let error = {...err}; 
//       console.log(err.name)
//       error.message = err.message
//       console.log('in prod error')
//       if (err.name === 'CastError') {
//         error = handleCastErrorDB(error)
//       } 
//       if (err.code === 11000){
//         error = handleDuplicateFieldsDB(error)
//       };
//       if (err.name === 'JsonWebTokenError') {
//         error = handleJwtError()
//       }
//       if (err.name === 'TokenExpiredError') {
//         error = jwtExpiredError()
//       }
//       if(err.name ==='ValidationError'){
//         error = handleValidationError(error)
//       } 
//       if(err.code === 403){
//         error = unAuthorizationError(error)
//       }
//       sendErrorProd(error,req,res)
//       next()
//     }
//   };  




  