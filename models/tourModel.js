const mongoose = require('mongoose');
const slugify = require('slugify'); 
const validator = require('validator');
const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name:{type:String,
       required:[true,'name is mandatory'],
       unique:true,
       maxlength: [40, 'Tour must have less than or equal to 40 characters'],
       minlength: [10, 'Tour must have greater than or equal to 10 character'],
       //validate: [validator.isAlpha,'Tour name must only contains characters']
    },

    slug: String,

    duration:{type:Number,
      required:[true,'Tour must have duration']},

    maxGroupSize:{type:Number,
      required:[true,'Tour must have maxgroupsize']},

    difficulty:{type:String,
      required:[true,'Tour must have difficulty'],
      enum:{values:['easy','medium','difficult'],
            message:'Difficulty is either easy medium or difficult'}},

    ratingsAverage:{
       type:Number,
       default:4.5,
       min:[1,'Rating must be above one'],
       max:[5,'Rating must be below five'],
       set: val => Math.round(val * 10) / 10
    },

    ratingsQuantity:{
      type:Number,
      default: 0
    },

    price:{
      type:Number,
      required:[true,'tour must have price property']
    },

    priceDiscount:{type:Number,
                   validate: {
                    validator:function(val){
                      // here this. only point to current doc. not working for update
                      return val < this.price
                    },
                    message: 'Discount price ({value}) should be below regular price.'
                   }},

    summary:{type:String,
             trim: true,
             required: [true,'A tour must have summary']},
            
    description:{
             type:String,
             trim:true
    },

    imageCover:{
             type:String,
             required:[true,'A tour must have cover image']
    },

    images: [String],

    createdAt:{
             type: Date,
             default: Date.now(),
             select:false
    },
    startDates:[Date],

    secretTour:{
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides:
     [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }]
    },
    {toJSON:{virtuals:true},
    toObject:{virtuals:true}
 });

 tourSchema.index({price:1,ratingAverage:-1});
 tourSchema.index({slug:1});
 tourSchema.index({startLocation:'2dsphere'});
 
 tourSchema.virtual('durationWeeks').get(function(){
         return this.duration / 7;
 });

 // Virtual populate
 tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

 // Document middleware runs before save() and create()

 tourSchema.pre('save',function(next) {
     this.slug = slugify(this.name, { lower:true });
     next()
 });

 tourSchema.pre('save',function(next) {
     console.log('doc will be saved succesfully')
     next()
});

// tourSchema.pre('save',async function(next) {
//      const guidePromise = this.guides.map(async id => 
//      await User.findById(id)      
//      ); 
//      this.guides = await Promise.all(guidePromise);
//      next()
// });

 tourSchema.post('save',function(doc,next) {
     console.log(doc)
     next()
 });

    /// Query middleware
 tourSchema.pre(/^find/,function(next) {
     this.find({secretTour:{$ne:true}});
     this.start = Date.now();
     next()
 });

 tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
     next();
 });

 tourSchema.post(/^find/,function(docs,next) {
     console.log(`Query took ${Date.now() - this.start} miliseconds.`);
     next()
 });

 // Aggregation middleware

//  tourSchema.pre('aggregate',function(next){
//       this.pipeline().unshift({$match: {secretTour:{$ne:true}}}); // unshift is used in beggining of array
//       console.log(this.pipeline());
//       next()
//  });

 const Tour = mongoose.model('Tour',tourSchema);

 module.exports = Tour;