const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErrors');

// 1) ROUTE HANDELERS

exports.aliasTopTours = (req,res,next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next()
};

exports.getAllTours = catchAsync(async (req,res) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

    const tours = await features.query;
    console.log(req.requestTime)
    res.status(300).json({
        status:'success',
        result:tours.length,
        data:{
            tours:tours
        }        // middle ware
    })
});

exports.getTour = catchAsync(async (req,res,next) => {
     const tour = await Tour.findById(req.params.id);
     // Tour.findOne({_id:req.params.id})
     if (!tour) {
        return next(new AppError('no tour found for that id',404))
     }
     res.status(300).json({
        status:'success',
        data:{
            tour
        }
        })
});

exports.createTour = catchAsync(async(req,res,next) => {
            const newTour = await Tour.create(req.body)
            res.status(201).json({
            status:'success',
            data: {
                tour:newTour
            }
            })
});


exports.deleteTour = catchAsync(async (req,res)=>{
    const deletedId = req.params.id;
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
        status:'success',
        message: `Document deleted successully`
    })
});

exports.updateTour = catchAsync(async (req,res)=>{
    const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    })
});

exports.getTourStats = catchAsync(async (req,res) => {
        const stats = await Tour.aggregate([
        {
         $match:{ratingAverage:{$gte: 4.5 }}
        },
        {
         $group:{
            _id:{$toUpper:'$difficulty'} ,  // group By Func.
            numTours:{$sum: 1},
            avgRating: {$avg: '$ratingAverage'},
            avgPrice: {$avg: '$price'},
            minPrice: {$min: '$price'},
            maxPrice: {$max: '$price'}
         }
        },
        {
           $sort: {avgPrice: 1}
        }
    ]);
           res.status(200).json({
           status:'success',
           data:{
              stats
        }
    }) 
});

exports.getMonthlyPlan = catchAsync(async (req,res) => {
         const year = req.params.year * 1;

         const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                } 
            }     
            },
            {
                $group: {
                    _id:{$month:'$startDates'},
                    numTourStarts: {$sum: 1},
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: {month:'$_id'}
            },
            {
                $project:{_id:0}
            },
            {
                $sort:{numTourStarts: -1}
            },
            {
                $limit:12
            }
         ]);
         res.status(200).json({
            status:'success',
            data:{
                plan
            }})
});
/////////////////////////////////////////////// REFERENCE PERPOSE ////////////////////////////////////////////////////
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


// exports.checkId = (req,res,next,val) => {
//     if(req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status:'failed',
//             message:'Invalid id'
//         })
//     }
//     next();
// };

// exports.getAllTours = (req,res) => {
//     console.log(req.requestTime)
//     res.status(300).json({
//         status:'success',
//         requestedAt:req.requestTime         // middle ware
//         // results:tours.length,
//         // data:{
//         //     tours:tours
//         // }
//     })
// };

// exports.getTour = (req,res) => {
//     console.log(req.params);
//     const id = req.params.id * 1;
//     // const tour = tours.find(el => el.id === id);
//     //if(id > tours.length)
//      res.status(300).json({
//         status:'success'
//         // results:tours.length,
//         // data:{
//         //     tour
//         // }
//     })
// };

// exports.createTour = (req,res) => {
//     //console.log(req.body)
//     // const newid = tours[tours.length - 1].id + 1;
//     // const newTour = Object.assign({id:newid},req.body);
//     // tours.push(newTour);

//     // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,
//     // JSON.stringify(tours),
//     // err => {
//         res.status(201).json({
//             status:'success',
//             data: {
//                 tour:newTour
//             }
//         })
//     };

// exports.checkBody = (req,res,next,val) => {
//     if(!req.body.name || !req.body.price) {
//         req.status(400).json({
//             status:'failed',
//             message:'name and price not found in body'
//         })
//     }
//     next()
// };

// Filtering
    // const queryObject = {...req.query};
    // const excludeFields = ['page','sort','limit','fields'];
    // excludeFields.forEach(el => delete queryObject[el])
    // console.log(req.query,queryObject);

    // // Advanced Filtering
    // // in get method in postman ?duration[gte]=5
    // let queryStr = JSON.stringify(queryObject);
    // queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,match => `$${match}`);
    // console.log(JSON.parse(queryStr))

    // let query = Tour.find(JSON.parse(queryStr));
    // const tours = await Tour.find()
    //               .where('duration')
    //               .equals(5)
    //               .where('difficulty')
    //               .equals('easy')
    //               .exec()

    // sorting
    // if (req.query.sort){
    //     const sortBy = req.query.sort.split(',').join(' ')
    //     console.log(sortBy)
    //     query = query.sort(sortBy)
    // }
    // else {
    //     query = query.sort('-createdAt')
    // };

    // limiting fields
    // if (req.query.fields) {
    //     const fields = req.query.fields.split(',').join(' ');
    //     query = query.select(fields)
    // }
    // else{
    //     query = query.select('-__v')
    // }

    // Pagination

    // const page = (req.query.page) * 1 || 1;
    // const limit = (req.query.limit) * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit)

    // if (req.query.page) {
    //     if (page * limit >  await Tour.countDocuments()) 
    //     throw new Error('This page does not exist')
    // }

