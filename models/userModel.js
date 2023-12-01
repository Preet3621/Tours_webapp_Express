const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// name,email,photo,password,passwordconfir

const userSchema = new mongoose.Schema({
    name:{type:String,
        required:[true,'user must have name']},

    email:{
        type:String,
        unique:true,
        required:[true,'user must have email'],
        lowecase:true,
        validate:[validator.isEmail,'please provide a valid email']
    },

    photo:[String],

    password:{type:String,
         minLength:[8,'password must have greater than or equal to 8 characters'],
         required:[true,'user must have password'],
         },

    passwordConfirm:{
        type:String,
        required:[true,'please confirm your password'],
        validate:{
            validator: function(el) {
                return el === this.password
            },
            message:'passwords are not the same '
        }
    }
});

// userSchema.pre('save', async function(next){
//     // only runs this function if password is actually modified
//     if(!this.isModified) return next();
//     this.password = await bcrypt.hash(this.password,12)
//     // delete passconf field
//     this.passwordConfirm = undefined;
//     next()
// });

//userSchema.methods.correctPassword = async function()

const User = mongoose.model('User',userSchema);

module.exports = User



















