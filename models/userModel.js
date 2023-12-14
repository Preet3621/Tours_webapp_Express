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

    role:{type:String,
          enum:['user','guide','lead-guide','admin'],
          default:'user'},

    password:{type:String,
         minLength:[8,'password must have greater than or equal to 8 characters'],
         required:[true,'user must have password'],
         select: false
        },

    passwordConfirm:{
        type:String,
        required:[true,'please confirm your password'],
        validate:{
            validator: function(el) {
                return el == this.password
            },
            message:'passwords are not the same '
        }
    },

    passwordChangedAt:Date
});

userSchema.pre('save', async function(next){
    // only runs this function if password is actually modified
    if(!this.isModified) return next();
    this.password = await bcrypt.hash(this.password,12)
    // delete passconf field
    this.passwordConfirm = undefined;
    this.passwordChangedAt = Date.now() - 1000;
    next()
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    //console.log(candidatePassword, userPassword); 
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
        console.log(this.passwordChangedAt,JWTTimestamp)
        return JWTTimestamp < changedTimeStamp
    }
    return false
}

const User = mongoose.model('User',userSchema);

module.exports = User
 


















