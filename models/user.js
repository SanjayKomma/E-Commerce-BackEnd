const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    street:{
        type:String,
    },
    city:{
        type:String,
    },
    ZipCode:{
        type:String,
    },
    country:{
        type:String
    },
    isDefault:{
        type:Boolean,
        default:false
    }
})
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['admin','buyer','seller'],
        default:'buyer'
    },
    phone:{
        type:String,
    },
    address:[addressSchema],
}, {timestamps: true});
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});
module.exports = mongoose.model('User', userSchema);