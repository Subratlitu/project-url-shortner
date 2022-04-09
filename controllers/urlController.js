const { status, redirect } = require('express/lib/response');
const mongoose=require('mongoose')
const urlModel=require('../models/urlModel')
const validUrl=require('../validators/validUrl')
const shortid = require('shortid')
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    11006,
    "redis-11006.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("3KsNAgsH3yYJWinF7geAIKnWhGb8M7na", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  //1. connect to the server
  //2. use the commands :
  
  //Connection setup for redis
  
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
  
  

const createShortUrl=async function(req,res){
    try{
    const requestBody=req.body;

    //checking wheather request body is empty or not
    if(!validUrl.isValidRequestBody(requestBody)){
        res.status(400).send({status:false,message:"invalid request body.please provide some valid data"})
        return
    }
    //checking wheather long url  is empty or not
    let {longUrl,urlCode}=requestBody
    if(!validUrl.isValid(longUrl)){
        res.status(400).send({status:false,message:"please provide some value in long url"})
        return
    }
    if(!validUrl.isValid(urlCode)){
        res.status(400).send({status:false,message:"please provide some value in url code"})
        return
    }
    //checking validity of a url
    longUrl=longUrl.trim();
    if(!longUrl) return res.status(400).send({status: false, message: "Please Provide a Long URL"}) 

    if(!validUrl.isValidUrl(longUrl)){
        res.status(400).send({status:false,message:"please provide a valid url link"})
        return
    }
    urlCode=urlCode.trim()
    urlCode=urlCode.toLowerCase()
    
    const baseUrl = 'http://localhost:3000'
    // validation end
        let url=await urlModel.findOne({longUrl:longUrl}).select({_id:0, longUrl:1, shortUrl:1, urlCode:1})
        if(url){
            res.status(200).send({status:true,data:url})
            return
        }
        else{
            const shortUrlPart = shortid.generate()
            const shortUrl = baseUrl + '/' + shortUrlPart
    
                    // invoking the Url model and saving to the DB
                    url = new urlModel({
                        longUrl,
                        shortUrl,
                        urlCode
                    })
                    await url.save()
                    await SET_ASYNC(`${urlCode}`,JSON.stringify(longUrl),"EX", 300)
                    res.status(200).send({status:true,message:"success",data:url})
        }
    }
    catch(error){
        return res.status(500).send({status:false, Error:error.message})  
    }
    
}

const geturl=async function(req,res){
    try{

    let params=req.params;
    let {urlCode}=params

    if(!validUrl.isValid(urlCode)){
        res.status(400).send({status:false,message:"please provide some value in url code"})
        return
    }
    //try to find from cache
    let cacheUrlCode=await GET_ASYNC(`${urlCode}`)
    if(cacheUrlCode){
        let parsedUrlCode=JSON.parse(cacheUrlCode)
        return res.status(302).redirect(parsedUrlCode)
    }
    //if i will not find from catch 
    let validUrlCode = await urlModel.findOne({urlCode})
    if(!validUrlCode) return res.status(404).send({status: false, message: "URL Code doesn't exists"})
    return res.status(302).redirect(validUrlCode.longUrl)
}
catch(error){
    return res.status(500).send({status:false, Error:error.message})  
}
}

module.exports={
    createShortUrl,
    geturl
}


