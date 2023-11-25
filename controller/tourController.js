const fs = require('fs');
const Tour = require('./../models/tourModel')

// 1) ROUTE HANDELERS

exports.getAllTours = async (req,res) => {
    try{
    const tours = await Tour.find();
    console.log(req.requestTime)
    res.status(300).json({
        status:'success',
        result:tours.length,
        data:{
            tours:tours
        }        // middle ware
    })
       }
    catch (err) {
        res.status(404).json({
            status:'failed',
            message: err.message
        })
    }
};

exports.getTour = async (req,res) => {
    try{
     const tour = await Tour.findById(req.params.id);
     // Tour.findOne({_id:req.params.id})
     res.status(300).json({
        status:'success',
        data:{
            tour
        }
        })
       }
    catch (err) {
        res.status(204).json({
            status:'failed',
            message: err.message
        })
    }
};

exports.createTour = async (req,res) => {
    try{
            const newTour = await Tour.create(req.body)
            res.status(201).json({
            status:'success',
            data: {
                tour:newTour
            }
            })
        }
    catch (err) {
        res.status(400).json({
            status:'failed',
            message: err.message
        })
    } 
} 


exports.deleteTour = async (req,res)=>{
    try{
    const deletedId = req.params.id;
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
        status:'success',
        message: `Document deleted successully`
    })
       }
    catch(err){
        res.status(404).json({
            status: 'failed',
            message: err.message
        })
    }
};

exports.updateTour = async (req,res)=>{
    try{
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
       }
    catch (err) {
        res.status(400).json({
            status:'failed',
            message:err.message
        })
    }
};
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

