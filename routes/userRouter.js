const express = require('express');
const userController = require('./../controller/userController')
const authController = require('./../controller/authController')

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/forgotpassword',authController.forgotPassword)
router.post('/login',authController.login)
router.patch('/resetpassword',authController.resetPassword)
//router.post('/resetpassword',authController.resetPassword)

router
.route('/')
.get(userController.getAllUsers)


router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports = router;