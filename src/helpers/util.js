exports.genrateCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
  
  }
  
  exports.getCurrentTime = () => {
    let d = new Date();
    return d;
  }
  exports.getCurrentTimeDiff = (date) => {
    console.log("date", date)
    let date1 = new Date(date).getMilliseconds();
    let c = new Date().getMilliseconds();
  
    return (c - date1)
  }