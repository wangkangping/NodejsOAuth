const express = require('express');
const router = express.Router();

var oauthClient = require('./oauthClient');

router.get('/', function(req, res) {

    var mailOptions = {
            from: 'wangkangping00@gmail.com', // sender address
            to: "wangkangping00@gmail.com",
            subject: 'Test Mail', // Subject line
            generateTextFromHTML: true,
            html: "<b>test</b>",
            auth: {
                user: 'wangkangping00@gmail.com'
            }
        },
        tokens = req.session["tokens"];

    mailOptions.auth.accessToken = tokens.access_token;
    mailOptions.auth.refreshToken = tokens.refresh_token;
    mailOptions.auth.expires = tokens.expiry_date;

    if (mailSending.checkExpired(tokens.expiry_date)) {

        oauth2Client.setCredentials({
            refresh_token: tokens.refresh_token
        });

        // get access token by refresh token
        // refresh_token will return only first time
        // set prompt to 'select_account', means user need to grant access to me each time
        // in true production, we should save refresh_token into database
        // once the access_token is expired, we could get new token obj(access_token) by refresh_token from oauth server
        oauth2Client.refreshAccessToken(function(err, tokens) {

            if (err || !tokens || !tokens.access_token) {

                res.json({ "success": false, message: "can not get token" });

                return;
            }

            // update the tokens for credentials and session
            oauth2Client.setCredentials(tokens);

            session.tokens = tokens;

            // send mail
            mailSending.sendMail(mailOptions, res);

        });

    }

    // send mail
    mailSending.sendMail(mailOptions, res);


});

var mailSending = {

    sendMail: function(mailOptions, res) {

        var smtpTransport = oauthClient.getSmtpTransport();

        smtpTransport.sendMail(mailOptions, function(error, response) {

            if (error) {

                res.send('send mail fail - ' + error);

            } else {

                res.send('Message sent successfully');
            }

        });

    },

    checkExpired: function(expiry_date) {

        if (!expiry_date) {
            return true;
        }

        var curTime = new Date().getTime();

        if (curTime >= expiry_date) {
            return true;
        } else {
            return false;
        }
    }
}



module.exports = router;