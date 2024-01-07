const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

    photo:{type:String,default:'default.jpg'},
    
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

    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{type: Boolean,
            default: true,
            select:false},
});

userSchema.pre('save', async function(next){
    // only runs this function if password is actually modified
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12)
    // delete passconf field
    this.passwordConfirm = undefined;
    this.passwordChangedAt = Date.now() - 1000;
    next()
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000
    next()
});

userSchema.pre(/^find/,async function(next){
    // here this saws query object
    this.find({active:{$ne:false}});
    next()
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    //console.log(candidatePassword, userPassword); 
    return await bcrypt.compare(candidatePassword,userPassword)
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
        console.log(this.passwordChangedAt,JWTTimestamp)
        return JWTTimestamp < changedTimeStamp
    }
    return false
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken},this.passwordResetToken)

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    console.log('last line')
    return resetToken
};

const User = mongoose.model('User',userSchema);

module.exports = User
 


















