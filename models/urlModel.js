const mongoose=require('mongoose');

const urlSchema=new mongoose.Schema({
    urlCode:{
        type:String,
        required:"url code is required",
        lowercase:true,
        trim:true
    },
    longUrl:{
        type:String,
        required:"long url is required"
    },
    shortUrl:{
        type:String,
        required:true,
        unique:true
    }


})
module.exports=mongoose.model('url',urlSchema)