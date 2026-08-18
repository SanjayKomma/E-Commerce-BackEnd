const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    name:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    comments:{
        type:String,
    }
}, {timestamps: true});
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    category:{
        type:String,
        required:true
    },
    stock:{
        type: Number,
        required: true,
        default: 0
    },
    image:{
        type:String,
    },
    reviews:[reviewSchema],
    rating:{
        type:Number,
        default:0
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
}, {timestamps: true});
productSchema.index({name:'text', description:'text'});
module.exports = mongoose.model('Product', productSchema);