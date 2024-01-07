const path = require('path') 
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appErrors');
const globalErrorHandler = require('./controller/errorController');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');
const bookingRouter = require('./routes/bookingRouter');


const app = express();
// set security http headers
app.use(helmet());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// serving static file
app.use(express.static(path.join(__dirname, 'public')));

// 1) GLOBAL MIDDLE WARES
console.log(process.env.NODE_ENV);
if ((process.env.NODE_ENV == 'development')) {
  app.use(morgan('dev'));
};

// Limit request from same api
const limiter = rateLimit({
  max:100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this IP,please try again in an hour'
});

app.use('/api',limiter)
app.use(express.json({limit:'10kb'})); // middleware
app.use(express.urlencoded({extended:true,limit:'10kb'}));
//app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against Nosql query injection
app.use(mongoSanitize())              // remove dollar and operator signs from req.body

// Data sanitization against xss
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Body parser, reading data from body into req.body
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});


app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter); // parent route
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

 // this midddleware runs last 

app.all('*',(req,res,next) => {
  // res.status(404).json({
  //   status:'failed',
  //   message:`can't find ${req.originalUrl}`
  // })
    //  const err = new Error(`can't find ${req.originalUrl}`);
    //  err.status = 'failed';
    //  err.statusCode = 404
     next(new AppError(`can't find ${req.originalUrl} on this server`,404))
});

//app.use(globalErrorHandler)

module.exports = app;

// 4) SERVER LISTENER

// app.get('/',(req,res) => {
//     //res.status(200).send('Hello from server side!')
//     res
//     .status(200)
//     .json({message:'Hello from the server side',app:'natours'})
// });

// app.post('/',(req,res) => {
//     res.send('you can post to this end point')
// });

// app.get('/api/v1/tours',getAllTours);
// app.get('/api/v1/tours/:id',getTour);
// app.post('/api/v1/tours',createTour);
// app.delete('/api/v1/tours/:id',deleteTour);
// app.patch('/api/v1/tours/:id',updateTour);
// 3) ROUTES
