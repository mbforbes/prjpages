// Module dependencies
var express = require("express");
var fs = require("fs");
var merge = require('merge');
var _ = require('underscore');
// var jade = require("jade");


// functions (do they go here?)
// Pimp my string (from
// http://stackoverflow.com/questions/280634/endswith-in-javascript)
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
// check if a file found is what we want (ignores .DS_Store, etc.)
var isJson = function(file_name) {
	return file_name.endsWith('.json');
};


// settings and stuff
var jade_options = {pretty: true};
var pub_dir = __dirname + '/public/';
var data_dir = pub_dir + 'data/';

var prj_dir = data_dir + 'projects/';
var research_dir = data_dir + 'research/';

var cat_dir = data_dir + 'categories/';
var prj_cat_file = cat_dir + 'project_categories.json';
var research_cat_file = cat_dir + 'research_categories.json';

var app = express();


// data
var prj_files = _.filter(fs.readdirSync(prj_dir), isJson);
var research_files = _.filter(fs.readdirSync(research_dir), isJson);
var prj_jsons = [];
var research_jsons = [];

// Grab all project and research categories
var prj_cats = JSON.parse(fs.readFileSync(prj_cat_file));
var research_cats = JSON.parse(fs.readFileSync(research_cat_file));

// Grab all projects and research(es...)
for (var i = 0; i < prj_files.length; i++) {
	var raw_json = JSON.parse(fs.readFileSync(prj_dir + prj_files[i]));
	raw_json.section = 'project';
	prj_jsons.push(raw_json);
}
for (var i = 0; i < research_files.length; i++) {
	var raw_json = JSON.parse(fs.readFileSync(research_dir + "/" + research_files[i]));
	raw_json.section = 'research';
	research_jsons.push(raw_json);
}
var data = {
	"prj_cats": prj_cats,
	"research_cats": research_cats,
	"prj_jsons": prj_jsons,
	"research_jsons": research_jsons,
};

console.log("num projects: " + prj_jsons.length);
console.log("num research: " + research_jsons.length);

// serve us up
app.use(express.logger());
app.use(express.static(pub_dir));
app.locals._ = require("underscore");

// routing
app.get('/', function(request, response) {
	locals = {"data": data}
	// console.log(locals);
	response.render(pub_dir + 'pt_prj.jade', merge(jade_options, locals));
});


// talk to the outside world
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});