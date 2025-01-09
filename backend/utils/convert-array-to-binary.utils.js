const convertArrayToBinaryValue = (binaryArray) => {
    let binaryValue = 0;
    binaryArray.forEach((bit) => {
        binaryValue = (binaryValue << 1) | bit;
        console.log(binaryValue);
    });
    return binaryValue;
}

const requestVerify = (value)=>{
    if(value & 8 )
    {
        return "GET";
    }
    else if(value & 4)
    {
        return "POST";
    }
    else if(value & 2)
    {
        return "PUT";
    }
    else if(value & 1){
        return "DELETE";
    }
    else if(value & 15)
    {
        return "ALL";
    }
    else{
        return "NONE";
    }
}
export { convertArrayToBinaryValue , requestVerify };