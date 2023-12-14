/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');
const mongoose = require('mongoose');


// process.on('uncaughtException' , err => {
//    console.log('UNCOUGHT EXCEPTION')
//    console.log(err.name,err.message)
//        process.exit(1)
// });


dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
   useNewUrlParser:true,
   useCreateIndex:true,
   useFindAndModify:false,
   useUnifiedTopology: true
}).then(() => {
   console.log('DB connection is successfull.')  
}).catch(err=>{console.error('Error connecting to DB',err)}); 

//console.log(process.env);
const port = process.env.PORT;
const server = app.listen(port, () => {
   console.log(`app running on port ${port}`);
});

//error outside of express and mongoose
process.on('unhandledRejection',err => { 
   console.log(err.name,err.message);
   console.log('Unhandled Rejection shutting down!....');
   server.close(() => {
   process.exit(1)})
});



