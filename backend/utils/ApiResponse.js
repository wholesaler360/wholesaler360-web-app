class ApiResponse {
    constructor(statusCode,data,message="Success")
    {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }   
}

const successCreated = (data,message) => {
    return new ApiResponse(201,data,message)
}
const successUpdated = (data,message) => {
    return new ApiResponse(201,data,message)
}
const successDeleted = (data,message) => {
    return new ApiResponse(204,data,message)
}

export {successCreated,successUpdated,successDeleted}