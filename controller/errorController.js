
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

const sendErrorDev = (err,res) => {
  res.status(err.statusCode).json({
    status:err.status,
    error: err,
    message:err.message,
    //stack:err.stack
})
};

const sendErrorProd = (err,res) => {
  if(err.isOperational) {
      console.log('in send error production')
      res.status(err.statusCode).json({
      status:err.status,
      message:err.message,
      //stack:err.stack
    })
  }
  else{
      res.status(500).json({
        status:'error',
        message:err,
        stack:err.stack
      })
  }
};

module.exports = (err,req,res,next) =>{
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV == 'development') {
        sendErrorDev(err,res)
        next()
    } 
    else if(process.env.NODE_ENV == 'production') {
      let error = {...err}; 
      console.log(err.name)
      console.log('in prod error')
      if (err.name === 'CastError') {
        error = handleCastErrorDB(error)
      } 
      if (err.code === 11000){
        error = handleDuplicateFieldsDB(error)
      };
      if (err.name === 'JsonWebTokenError') {
        error = handleJwtError()}
      if (err.name === 'TokenExpiredError') {
        error = jwtExpiredError()
      }

      // const errorMessages = Object.values(error.message.errors).map(error => error.message);
      // console.log(errorMessages);
      if(err.name ==='ValidationError'){
        error = handleValidationError(error)
      } 
      sendErrorProd(error,res)
      next()
    }
  };  