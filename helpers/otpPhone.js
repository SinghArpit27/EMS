const accountSid = 'AC71717d03925ff2c5c506bc56f442cfb5';
const authToken = '5e26d9b9e3c214eae47f35f7f4a73c87';
const client = require('twilio')(accountSid, authToken);

const phoneOTP = (name, phone, otp) => {
    client.messages.create({
        from: '+17622513080',
        to: `+91${phone}`,
        body: 'Hi ' + name + ', Please verify Your account with OTP: ' + otp
    })
    .then(message => console.log(`OTP has been sent:- ${phone}`))
    .catch((err) => {console.log(err)});
}

module.exports = phoneOTP;