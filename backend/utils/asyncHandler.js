const asyncHandler = (requestHandler)=>{
    return (req,res,next) =>{
        // It wraps the request inside the Promise so that it could be handled better
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}

export {asyncHandler}   