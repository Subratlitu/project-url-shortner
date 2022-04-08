

const isValidUrl=function(longUrl){
    return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(
        longUrl
    )
}
const isValidRequestBody=function(requestBody){
    return Object.keys(requestBody).length>0
}
const isValid=function(value){
    if(typeof value ==='undefined' || value===null)return false
    if(typeof value==='string' && value.trim().length===0)return false
    return true;
}
module.exports={
    isValidUrl,
    isValid,
    isValidRequestBody
}