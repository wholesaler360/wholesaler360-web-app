class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.value = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    // Static method for creating a response for a successful creation
    static successCreated(data, message) {
        return new ApiResponse(201, data, message);
    }
    
    // Static method for creating a response for a successful update
    static successUpdated(data, message) {
        return new ApiResponse(201, data, message);
    }

    // Static method for creating a response for a successful read
    static successRead(data, message) {
        return new ApiResponse(200, data, message);
    }

    // Static method for creating a response for a successful deletion
    static successDeleted(data, message) {
        return new ApiResponse(204, data, message);
    }
}

export { ApiResponse }