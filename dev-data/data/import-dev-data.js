const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const fs = require('fs');

dotenv.config({ path: './config.env' });
console.log(process.env.DATABASE)
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

console.log(DB)

mongoose
  .connect(DB, {
  })
  .then(() => console.log('DB connection successful!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));

const importData = async () => {
    try {
    await Tour.create(tours);
    console.log('data successfully loaded');
        } catch (err){
        console.log(err)
        }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
        } 
    catch (err){
        console.log(err)
        }
        process.exit();
};

if (process.argv[2] == '--import') {
    importData();
} else if (process.argv[2] == '--delete') {
    deleteData();
};
