/**
 * Module dependencies
 */
var express = require("express");
var fs = require("fs");
var merge = require('merge')
// var jade = require("jade");

var jade_options = {pretty: true};
var pub = __dirname + '/public';
var app = express();

// data
var content = JSON.parse(fs.readFileSync(pub + "/testobj.json", "utf8"));
var fs.readdirSync('')

app.use(express.logger());
app.use(express.static(pub));

app.get('/', function(request, response) {
	locals = {content: content}
	response.render(pub + '/pt_prj.jade', merge(jade_options, locals));	
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});