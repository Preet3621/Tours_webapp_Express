const express = require('express');
const userController = require('./../controller/userController')
const authController = require('./../controller/authController')

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/forgotpassword',authController.forgotPassword)
router.post('/login',authController.login)
router.patch('/resetpassword/:token',authController.resetPassword);
router.patch('/updatepassword',authController.protect,authController.updatePassword)
router.patch('/updateme',authController.protect,userController.updateUser)
router.delete('/deleteme',authController.protect,userController.deleteUser)
router.get('/:id',authController.protect,userController.getUser)

router
.route('/')
.get(authController.restrictTo('admin'),userController.getAllUsers);

module.exports = router;