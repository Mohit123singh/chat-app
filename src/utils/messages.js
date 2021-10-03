const generatingMessage=(username,text)=>{
    return {
        username,
        text,
        createdAt:new Date().getTime(),
    }
}

const generatingLocationMessage=(username,url)=>{
    return {
        username,
        url,
        createdAt:new Date().getTime(),
    }
}

module.exports={
    generatingMessage,
    generatingLocationMessage,
    
}