const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'benj@toacoin.com',
        subject: 'Thanks for signing up',
        text: `Welcome to the app, ${name}`,
        //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'benj@toacoin.com',
        subject: 'Account Cancellation',
        text: `Hi ${name}, it seems you deleted your account with us. If it's alright with you, please let me know the reason why by replaying to this email.
        
        Thanks`,
        //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    })
}

module.exports = {
    sendWelcomeEmail, sendCancelEmail
}