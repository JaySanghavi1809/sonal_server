module.exports = {
    UNAUTHORIZED: "Missing Authorization Header",
    FORBIDDEN: "Invalid email or password!",
    INVALID_TOKEN: "Invalid Token",
    EMPTY_TOKEN: "EMPTY Token",
    UPDATE_MESSAGE: "Data updated successfully",
    REGISTRATION_MESSAGE: "Registration Sucessfully",
    EMAIL_MESSAGE: "Invalid Email",
    USER_EXIST: "Username/Email already exists, please try sign in",
    PERMISSION_ERROR: "Permission not granted for this role",
    REQIRED_MESSAGE: (field) => { return `${field} is required` },
    RESET_SUBJECT: "Reset Password",
    RESET_MESSAGE: "Reset Password send to your register email id ",
    PASSWORD_RESET_MESSAGE: "Password reset sucessfully",
    INVALID_PAYLOAD: "Invalid Payload",

}