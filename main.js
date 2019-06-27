const path = require('path');
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const Session = require('express-session');

var detail = require('./routes/detail');
var oauthClient = require('./routes/oauthClient');
var mailSending = require('./routes/mailSending');

// init express session
// all own modules share the session id
// BUT need keep init express session area before app.use
app.use(Session({
    secret: 'june-resource-secret-19890913007',
    resave: true,
    saveUninitialized: true
}));

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'));


app.use('/details', detail);
app.use('/mailSending', mailSending);

app.get('/', (request, response) => {

    response.render('main', {
        authUrl: oauthClient.getAuthUrl()
    });

});

app.get("/oauthCallback", (req, res) => {
    // get auth code from url
    var code = req.query.code,
        session = req.session,
        // get tokens (access_token and refresh_token...) from oauth server by auth code
        oauth2Client = oauthClient.getOAuthClient();

    if(!code) {

    	res.send('Can not get auth code from oauth server');

    	return
    }

    if(session['tokens'] && session['tokens'].access_token) {

        res.send('<h3>Login successful!</h3><a href="/details">Go to details page</a></br><a href="/mailSending">Send TEST Mail</a>');
        
        return;
    }

    oauth2Client.getToken(code, (err, tokens) => {
        if (!err) {
            oauth2Client.setCredentials(tokens);
            session["tokens"] = tokens;
            res.send('<h3>Login successful!</h3><a href="/details">Go to details page</a></br><a href="/mailSending">Send TEST Mail</a>');
        } else {
            res.send('<h3>Login failed!!</h3>');
        }
    });

});

app.listen(3000, (err) => {

    if (err) {
        return console.log('something bad happened', err)
    }

    console.log('server is listening on 3000');
})

app.use((err, request, response, next) => {
    // log the error, for now just console.log
    console.log(err)
    response.status(500).send('Something broke!')
});

module.exports = app;