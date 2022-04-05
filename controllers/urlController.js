const { status, redirect } = require('express/lib/response');
const mongoose=require('mongoose')
const urlModel=require('../models/urlModel')
const validUrl=require('../validators/validUrl')
const shortid = require('shortid')

const createShortUrl=async function(req,res){
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
    if(!validUrl.isValidUrl(longUrl)){
        res.status(400).send({status:false,message:"please provide a valid url link"})
        return
    }
    urlCode=urlCode.trim()
    urlCode=urlCode.toLowerCase()
    
    const baseUrl = 'http://localhost:3000'
    if(!validUrl.isValidUrl(baseUrl)){
        res.status(400).send({status:false,message:"please provide a valid base url link"})
        return
    }
    // validation end

    const shortUrlPart = shortid.generate()
    let url=await urlModel.findOne({longUrl:longUrl})
    if(url){
        res.status(200).send({status:true,data:url})
    }
    else{
        const shortUrl = baseUrl + '/' + shortUrlPart

                // invoking the Url model and saving to the DB
                url = new urlModel({
                    longUrl,
                    shortUrl,
                    urlCode
                })
                await url.save()
                res.status(200).send({status:true,message:"success",data:url})
    }


}

const geturl=async function(req,res){

    let urlCode=req.params.urlCode;

    let validUrlCode = await urlModel.findOne({urlCode:urlCode})
    if(!validUrlCode) return res.status(404).send({status: false, message: "URL Code doesn't exists"})

    let url=validUrlCode.longUrl;
    console.log(url)
   // Response.redirect(url, 301);
    return res.status(302).redirect(url)//302 Found means that the requested resource has been moved temporarily to a new URL
}

module.exports={
    createShortUrl,
    geturl
}