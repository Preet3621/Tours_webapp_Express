const express = require('express');
const router = express.Router();
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');

//router.param('id', tourController.checkId);

router
.route('/top-5-cheap')
.get(tourController.aliasTopTours,tourController.getAllTours)

router
.route('/monthly-plan/:year')
.get(tourController.getMonthlyPlan);

router
.route('/tour-stats')
.get(tourController.getTourStats);

router
.route('/')
.get(authController.protect,tourController.getAllTours)
.post(tourController.createTour);

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(authController.protect,
        //tourController.restrictTo('admin'),
        tourController.deleteTour);

module.exports = router; 