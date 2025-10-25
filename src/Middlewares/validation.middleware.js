const reqKeys = ['body', 'params', 'query','headers'];
export const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of reqKeys) {
            if (schema[key]) {
                const {error} = schema[key].validate(req[key], {abortEarly: false});
                
                // Only push errors if they exist
                if (error) {
                    validationError.push(...error.details);
                }
            }
        }
        
        if (validationError.length > 0) {
            return res.status(400).json({
                message: "Validation Error",
                details: validationError
            });
        }
        next();
    };
};