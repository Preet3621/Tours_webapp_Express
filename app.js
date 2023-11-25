const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

// 1) MIDDLE WARES
console.log(process.env.NODE_ENV);
if ((process.env.NODE_ENV = 'development')) {
  app.use(morgan('dev'));
}
app.use(express.json()); // middleware
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter); // parent route

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
