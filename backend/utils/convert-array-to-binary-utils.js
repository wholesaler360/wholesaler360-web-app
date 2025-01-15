const convertArrayToBinaryValue = (binaryArray) => {
    let binaryValue = 0;
    binaryArray.forEach((bit) => {
        binaryValue = (binaryValue << 1) | bit;
        console.log(binaryValue);
    }); 
    return binaryValue;
}

const requestTypeToNum = (requestType) => {
    switch (requestType) {
        case "GET":
            return 8;
        case "POST":
            return 4;
        case "PUT":
            return 2;
        case "DELETE":
            return 1;
        default:
            return 0;
    }
}

const requestVerify = (permission,requestType) => {
    const requestName = requestTypeToNum(requestType);
    
    if((permission & requestName))
    {
        return true;
    }
    return false;
}

export { convertArrayToBinaryValue , requestVerify };