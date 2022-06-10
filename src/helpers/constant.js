exports.EMAILCONSTANT = {
    IMAGES: { logo: 'api/src/uploads/Logo.png' },
    SIGNUP_OTP: { template: 'sign_up', subject: 'WELCOME TO SONAR MEDIA', url: (email) => { return `verify-otp/${email}` } },
    WELCOME_VERIFIED: { template: 'welcome', subject: 'WELCOME TO SONAR MEDIA', url: `welcome` },
    FORGOT: { template: 'forgot_password', subject: 'SONAR MEDIA - Verification with OTP', url: (email) => { return `reset-password/${email}` } },
    RESENDOTP: { template: 'resend_otp', subject: 'SONAR MEDIA - Resend OTP' },
    ADMINISTRATOR_MAIL: { template: 'adminstrator', subject: 'Modification of environment file configuration' }
}