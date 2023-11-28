const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'));

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
        console.log('data successfully deleted');
        } catch (err){
            console.log(err)
        }
        process.exit();
};

if (process.argv[2] == '--import') {
    importData();
} else if (process.argv[2] == '--delete') {
    deleteData();
};
