export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string>;
}

// ? means This property is optional.
// Because your backend has two types of errors.
// Duplicate error
// {
//   "status": 400,
//   "message": "Email already exists"
// }
// There is no errors property. So errors? must be optional
// Validation error
// {
//   "status": 400,
//   "message": "Validation Failed",
//   "errors": {
//     "email": "Invalid email format",
//     "name": "Name is required"
//   }
// }
// Here errors exists.

// What is Record<string, string>?
// It means: "An object where the keys are strings and the values are strings."