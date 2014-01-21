/**
 * Module dependencies
 */
var express = require("express");
// var jade = require("jade");

var pub = __dirname + '/public';
var app = express();

app.use(express.logger());
app.use(express.static(pub));

app.get('/', function(request, response) {
	response.sendfile(pub + '/pt_prj.html');
});

app.get('/jadetest', function(request, response) {
	response.render(pub + '/testpage.jade');
	// var options = {pretty: true, deubg: true}
	// response.send(jade.renderFile(pub + '/testpage.jade', options))
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});