/* Copyright IBM Corp. 2014 All Rights Reserved                      */

// Require and create the Express framework
var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');

// Determine port to listen on
var port = (process.env.PORT || process.env.VCAP_APP_PORT || 80);

// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');
app.use(bodyParser.urlencoded());

app.use(bodyParser.json());

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.post('/log-info', function(req, res) {
	console.log(JSON.stringify(req.body));
        res.json({ok: true});
});

app.post('/register', function(req, res){
	var arn = JSON.stringify(req.body.object.metadata.annotations.targetGroupArn);
	var ip = JSON.stringify(req.body.object.status.podIP);
	console.log("Load Balancer Target Group: " + arn);
	console.log("Target IP: " + ip);
        res.json({ok: true});
});


var server = app.listen(port, function() {
        console.log('Listening on port %d', server.address().port);
});

