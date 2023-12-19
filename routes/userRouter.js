const express = require('express');
const userController = require('./../controller/userController')
const authController = require('./../controller/authController')

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

// router.post('/signup',authController.signup);
// router.post('/forgotpassword',authController.forgotPassword)
// router.post('/login',authController.login)
// router.patch('/resetpassword/:token',authController.resetPassword);
// router.patch('/updatepassword',authController.protect,authController.updatePassword)
// router.patch('/updateme',authController.protect,userController.updateUser)
// router.delete('/deleteme',authController.protect,userController.deleteUser)
// router.get('/:id',authController.protect,userController.getUser)

// router
// .route('/')
// .get(authController.restrictTo('admin'),userController.getAllUsers);

// module.exports = router;