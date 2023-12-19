const express = require('express');
const router = express.Router();
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./../routes/reviewRouter')


//router.param('id', tourController.checkId);

router.use('/:tourId/reviews', reviewRouter)

router
.route('/top-5-cheap')
.get(tourController.aliasTopTours,tourController.getAllTours)

router
.route('/monthly-plan/:year')
.get(authController.protect,
     authController.restrictTo('admin','lead-guide'),
     tourController.getMonthlyPlan);

router
.route('/tour-stats')
.get(tourController.getTourStats);

router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect,
      authController.restrictTo('admin','lead-guide'),
      tourController.createTour);

router
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.updateTour)
.delete(authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.deleteTour);

module.exports = router; 