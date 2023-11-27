/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');


//console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`app running on port ${port}`);
});

const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
   useNewUrlParser:true,
   useCreateIndex:true,
   useFindAndModify:false,
   useUnifiedTopology: true
}).then(() => {
   console.log('DB connection is successfull.')
}).catch(err=>{console.error('Error connecting to DB',err)}); 

