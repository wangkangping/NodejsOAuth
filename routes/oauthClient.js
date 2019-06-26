const express = require('express');
const router = express.Router();

// extract the google property directly be using ES6 destructuring which fixed this issue and all the further issues which were created by it.
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const nodemailer = require('nodemailer');

const ClientId = "460949419444-ki5q0g0uk464kki3lribftahbev786ri.apps.googleusercontent.com";
const ClientSecret = "CuAqxw4ifAWXkk5znc5iJb1J";
const RedirectionUrl = "http://localhost:3000/oauthCallback/";

var oauthClient = {
    getAuthUrl: function() {
        var oauth2Client = this.getOAuthClient();
        // generate a url that asks permissions for Google+ and Google Calendar scopes
        var scopes = [
            'https://www.googleapis.com/auth/plus.me',
            'https://mail.google.com/'
        ];

        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes, // If you only need one scope you can pass it as string
            // approval_prompt: "force"
            // refresh_token will return only first time
            // set prompt to 'select_account', means user need to grant access to me each time
            // in true production, we should save refresh_token into database
            // once the access_token is expired, we could get new token obj(access_token) by refresh_token from oauth server
            prompt: 'select_account'
        });

        return url;
    },

    getOAuthClient: function() {

        return new OAuth2(ClientId, ClientSecret, RedirectionUrl);

    },

    getSmtpTransport: function() {

        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,

            auth: {
                type: 'OAuth2',
                clientId: ClientId,
                clientSecret: ClientSecret
            }
        });
    }
}

module.exports = oauthClient;