const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review,'user');
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// exports.getAllReviews = catchAsync(async (req,res,next) => {
//   let filter = {};
//    if(req.params.tourId) filter = {tour:req.params.tourId}
//    const review = await Review.find(filter);

//    res.status(201).json({
//       status:'success',
//       data: review
//    })
// });


// exports.getReview = catchAsync(async (req,res,next) => {
//   const review = await Review.findById(req.params.id).populate('user').populate('tour')
//   // Tour.findOne({_id:req.params.id})
//   if (!review) {
//      return next(new AppError('no tour found for that id',404))
//   }
//   res.status(300).json({
//      status:'success',
//      data:{
//          review
//      }
//      })
// });
// exports.createReview = catchAsync(async (req,res,next) => {
//      if(!req.body.tour) req.body.tour = req.params.tourId;
//      if(!req.body.user) req.body.user = req.user.id;

//      const newReview = await Review.create(req.body);
//      res.status(201).json({
//       status:'success',
//       data: newReview
//      })
// });
