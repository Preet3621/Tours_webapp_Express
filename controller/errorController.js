
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
      res.status(err.statusCode).json({
      status:err.status,
      message:err.message
    })
  }
  else{
      res.status(500).json({
        status:'error',
        message:err
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
      if (err.name === 'CastError') {
        error = handleCastErrorDB(error)
      } 
      if (err.code === 11000){
        error = handleDuplicateFieldsDB(error)
      };

      // const errorMessages = Object.values(error.message.errors).map(error => error.message);
      // console.log(errorMessages);
      if(err.name ==='ValidationError'){
        error = handleValidationError(error)
      } 
      sendErrorProd(error,res)
      next()
    }
  };  