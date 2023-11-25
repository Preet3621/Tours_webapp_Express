const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name:{type:String,
       required:[true,'name is mandatory'],
       unique:true
    },
    duration:{type:Number,
      required:[true,'Tour must have duration']},

    maxGroupSize:{type:Number,
      required:[true,'Tour must have maxgroupsize']},

    difficulty:{type:String,
      required:[true,'Tour must have difficulty']},

    ratingAverage:{
       type:Number,
       default:4.5
    },

    ratingQuantity:{
      type:Number,
      default: 0
    },

    price:{
      type:Number,
      required:[true,'tour must have price property']
    },

    priceDiscount:Number,

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

    image: [String],

    createdAt:{
             type: Date,
             default: Date.now()
    },

    startDates:[Date]
 });

 const Tour = mongoose.model('Tour',tourSchema);

 module.exports = Tour;