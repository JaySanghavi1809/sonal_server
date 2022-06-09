exports.CustomError=(message,code)=>{
    let error=new Error(message);
    error.code=code
    return error;
},
exports.NotFoud=(message=" Not Found")=>{
    let error=new Error(message);
    error.code=404
    return error;
}

exports.AppEror=(message,code)=>{
    let error=new Error(message);
    error.code=500
    return error;
}
