const express = require('express');
const userController = require('./../controller/userController')
const authController = require('./../controller/authController')

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/signin',authController.login)

router
.route('/')
.get(userController.getAllUsers)


router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports = router;