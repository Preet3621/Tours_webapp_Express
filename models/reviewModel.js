const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'user',
      select: 'name photo'
    })
    next()
});

reviewSchema.statics.calcAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match:{tour:tourId}
    },
    {
      $group:{
        _id:'$tour',
        nrating:{$sum:1},
        ratingAverage:{$avg:'$rating'}
      }
    }
  ]);
  console.log(stats)
      if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nrating,
        ratingsAverage: stats[0].ratingAverage
      });
    } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      });
    }
};

reviewSchema.post('save', async function(){
  // next() is not worked in post 'save' method
  //here constructor pioints to Review model, we can not directly write Review here bcz that not yet defined 
  await this.constructor.calcAverageRating(this.tour)
});


reviewSchema.pre(/^findOneAnd/, async function(next) {
  try{
  console.log('entered in middleware')
  // console.log(this.tree)
  // console.log(body)
  next()}
  catch(err){
       console.log(err)
  }
});

reviewSchema.post(/^findOneAnd/, async function(body) {
  // await this.findOne(); does NOT work here, query has already executed
  console.log('entered in post middleware')
  this.r = body

  await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;