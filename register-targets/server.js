var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var elb = new AWS.ELBv2();
app.enable('trust proxy');
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
var port = (process.env.PORT || process.env.VCAP_APP_PORT || 80);


app.post('/log-info', function(req, res) {
	console.log(JSON.stringify(req.body));
    res.json({ok: true});
});

app.post('/register', function(req, res){
	var targetGroupArn = JSON.stringify(req.body.object.metadata.annotations.targetGroupArn);
	var targetIp = JSON.stringify(req.body.object.status.podIP);
	var targetPort = JSON.stringify(req.body.object.metadata.annotations.targetPort);

	console.log("Load Balancer Target Group: " + targetGroupArn);
	console.log("Target IP: " + targetIp + " Port: " + targetPort);

	var params = {
	  TargetGroupArn: targetGroupArn,
	  Targets: [
	    {
	      Id: targetIp,
	      AvailabilityZone: 'all',
	      Port: targetPort
	    },
	  ]
	};

	elb.registerTargets(params, function(err, data) {
	  if(err){
			console.log(err, err.stack);
			res.status(500).json({ error: 'failed to register target' });
		}else{
			console.log(data);
			res.status(200).json({response: JSON.stringify(data)});
		}
	});
});

var deregister = function(params){
	elb.deregisterTargets(params, function(err, data) {
		if(err){
			console.log(err, err.stack);
			return false;
		}else{
			return data;
		}
	});
}

app.post('/deregister', function(req, res){
	var targetGroupArn = JSON.stringify(req.body.object.metadata.annotations.targetGroupArn);
	var targetIp = JSON.stringify(req.body.object.status.podIP);
	var targetPort = JSON.stringify(req.body.object.metadata.annotations.targetPort);

	var params = {
	  TargetGroupArn: targetGroupArn,
	  Targets: [
	    {
	      Id: targetIp,
	      AvailabilityZone: 'all',
	      Port: targetPort
	    },
	  ]
	};

	for(retries = 0, retries < 4; retries++; ){
		if(retries == 3){
			res.status(500).json({ error: 'Failed to deregister target. Giving up.' });
			break;
		}

		var result = deregister(params);
		if(result){
			console.log("Registered target: " + targetIp + ":" + targetPort + "to " + targetGroupArn);
			console.log(result);
			res.status(200).json({response: "Registered target: " + targetIp + ":" + targetPort + "to " + targetGroupArn});
			break;
		}else{
			setTimeout(deregister, 5000, params)
		}
	}
});

var server = app.listen(port, function() {
        console.log('Listening on port %d', server.address().port);
});
