const express = require('express');
const router = express.Router();
// extract the google property directly be using ES6 destructuring which fixed this issue and all the further issues which were created by it.
const { google } = require('googleapis');
const plus = google.plus('v1');

var oauthClient = require('./oauthClient');

router.get("/", function(req, res) {

    console.log('entering to detail page');

    var oauth2Client = oauthClient.getOAuthClient();
    oauth2Client.setCredentials(req.session["tokens"]);

    new Promise(function(resolve, reject) {
        // https://developers.google.com/+/web/api/rest/latest/people/get
        // me 
        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
            if (!err) {
                resolve(response.data)
            } else {
                reject(err)
            }
        });
    }).then(function(data) {
        res.send('<img src=${data.image.url} /><h3>Id ${data.id}</h3><h3>Hello ${data.displayName}</h3><h3>profile url ${data.url}</h3>');
    }).catch(function(err) {
        res.send('message get failed!');
    })
});

module.exports = router;