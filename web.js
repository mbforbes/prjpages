////////////////////////////////////////////////////////////////////////////////
// LOAD AND CONFIGURE MODULE DEPENDENCIES
////////////////////////////////////////////////////////////////////////////////

// Load module dependencies
var express = require("express");
var logger = require("morgan");
var fs = require("fs");
var _ = require('underscore');
var marked = require('marked');
var highlight = require('highlight.js');
var CSON = require('cson');
// var jade = require("jade");

// Configure module dependencies
marked.setOptions({
	highlight: function (code) {
		return highlight.highlightAuto(code).value;
	}
});

////////////////////////////////////////////////////////////////////////////////
// SETTINGS
////////////////////////////////////////////////////////////////////////////////

// app settings
var jade_options = {pretty: true};
var app = express();
var valid_endings = ['.json', '.cson'];
//var router = new express.Router();

// directories
var propfile = 'prop.cson'; // describes categories
var itemfile = 'item.cson'; // describes items
var postfile = 'post.md'; // describes posts
var pub_dir = __dirname + '/public/';
var views_dir = pub_dir + 'views/';
var data_dir = pub_dir + 'data/';
var prj_dir = data_dir + 'projects/';
var research_dir = data_dir + 'research/';
var cat_dir = data_dir + 'categories/';
var prj_cat_file = cat_dir + 'project_categories.cson';
var research_cat_file = cat_dir + 'research_categories.cson';
var ex_md_text = marked(fs.readFileSync(prj_dir +
	'programming/maxwellforbes.com/post.md',
	{encoding: 'utf8'}));

////////////////////////////////////////////////////////////////////////////////
// CONFIGURE SERVER
////////////////////////////////////////////////////////////////////////////////

// Pimp my string (from
// http://stackoverflow.com/questions/280634/endswith-in-javascript)
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// check if a file found is what we want (ignores .DS_Store, etc.)
var isLoadable = function(file_name) {
	for (var i = 0; i < valid_endings.length; i++) {
		if (file_name.endsWith(valid_endings[i])) {
			return true;
		}
	}
	return false;
};

var isDirectory = function(file_path) {
	return fs.statSync(file_path).isDirectory();
};

// Load a file (must have a valid suffix).
var loadFile = function(file_path) {
	if (file_path.endsWith('.json')) {
		return JSON.parse(fs.readFileSync(file_path));
	} else if (file_path.endsWith('.cson')) {
		var tmp = CSON.parseFileSync(file_path);
		return CSON.parseFileSync(file_path);
	} else {
		console.warn('File ending not implemented for: ' + file_path);
	}
};

// generate the project names / icons array by loading from the filesystem
var genCatsForDir = function(dirname) {
	var c1 = fs.readdirSync(dirname);
	var candidates = _.filter(fs.readdirSync(dirname),
		function(f) { return fs.statSync(dirname + f).isDirectory(); });
	var results = [];
	for (var i = 0; i < candidates.length; i++) {
		results.push({
			name: candidates[i],
			icon: loadFile(dirname + candidates[i] + '/' + propfile).icon
		});
	}
	return results;
};

// To avoid creating the function in a loop, we provide an isDirectory with
// context for a prefix.
var isDirectoryPrefix = function(file_path) {
	return isDirectory(this + file_path);
};

// Also avoiding creating a function in a loop, this just checks if the
// past argument is equal to this
var equalToThis = function(arg) {
	return arg == this;
};

// scanns all categories within basedir (either projects or research) and
// gets all item objects within directories it finds
var loadItems = function(basedir, section, cats) {
	var results = [];
	for (var i = 0; i < cats.length; i++) {
		var cat = cats[i];
		// find all possible project/research entries within a project /
		// research category
		var catdir = basedir + cat.name + '/';
		console.log('loading items for: ' + catdir);
		var candidates = _.filter(fs.readdirSync(catdir),
			isDirectoryPrefix,
			catdir);
		console.log('candidates: ' + candidates);
		for (var j = 0; j < candidates.length; j++) {
			// for each entry (candidate), see if it contains an item.cson file
			var candidatedir = catdir + candidates[j] + '/';
			var itemfiles = _.filter(fs.readdirSync(candidatedir), equalToThis,
				itemfile);
			//function(filename) { return filename ==  itemfile});
			console.log('candidatedir: ' + candidatedir);
			console.log('itemfiles: ' + itemfiles);
			if (itemfiles.length >= 1) {
				// we just use the first if there's more than one itemfile
				newitem = loadFile(candidatedir + itemfiles[0]);
				newitem.section = section;
				newitem.cat = cat.name;
				results.push(newitem);
			}
		}
	}
	return results;
};

////////////////////////////////////////////////////////////////////////////////
// LOAD ALL OF THE DATA
////////////////////////////////////////////////////////////////////////////////

// data
var prj_files = _.filter(fs.readdirSync(prj_dir), isLoadable);
var research_files = _.filter(fs.readdirSync(research_dir), isLoadable);
var prj_jsons = [];
var research_jsons = [];

// Grab all project and research categories
// var prj_cats = loadFile(prj_cat_file);
var prj_cats = genCatsForDir(prj_dir);
//var research_cats = loadFile(research_cat_file);
var research_cats = genCatsForDir(research_dir);

// Grab all projects and research(es...)
for (var i = 0; i < prj_files.length; i++) {
	var raw_json = loadFile(prj_dir + prj_files[i]);
	raw_json.section = 'project';
	prj_jsons.push(raw_json);
}
for (var i = 0; i < research_files.length; i++) {
	var raw_json = loadFile(research_dir + research_files[i]);
	raw_json.section = 'research';
	research_jsons.push(raw_json);
}

var prj_jsons = loadItems(prj_dir, 'project', prj_cats);
var research_jsons = loadItems(research_dir, 'research', research_cats);

var data = {
	"prj_cats": prj_cats,
	"research_cats": research_cats,
	"prj_jsons": prj_jsons,
	"research_jsons": research_jsons,
};

// For safety of matching OK categories
var ok_cats = [];
for (var i = 0; i < prj_cats.length; i++) {
	ok_cats.push(prj_cats[i].name);
}
for (var i = 0; i < research_cats.length; i++) {
	ok_cats.push(research_cats[i].name);
}

// Basic reporting for debugging.
console.log("num projects: " + prj_jsons.length);
console.log("num research: " + research_jsons.length);
console.log(data);

////////////////////////////////////////////////////////////////////////////////
// CONFIGURE SERVER
////////////////////////////////////////////////////////////////////////////////

app.use(logger());
app.use(express.static(pub_dir));
app.locals._ = require("underscore");

////////////////////////////////////////////////////////////////////////////////
// CONFIGURE ROUTING
////////////////////////////////////////////////////////////////////////////////

app.get('/item', function(request, response) {
	var locals = {"data": data, "mdtext": ex_md_text};
	response.render(views_dir + 'page_post.jade',
		_.extend({}, jade_options, locals));
});

app.get('/:cat', function(request, response) {
	var cat = request.params.cat;
	var activecat;
	if (ok_cats.indexOf(cat) > -1) {
		activecat = cat;
	}
	var locals = {"data": data, "activecat": activecat};
	response.render(views_dir + 'page_overview.jade',
		_.extend({}, jade_options, locals));
});

app.get('/:cat/:item', function(request, response) {
	var cat = request.params.cat;
	var activecat;
	if (ok_cats.indexOf(cat) > -1) {
		activecat = cat;
	}
	var locals = {"data": data, "activecat": activecat};
	response.render(views_dir + 'page_overview.jade',
		_.extend({}, jade_options, locals));
});

app.get('/', function(request, response) {
	var locals = {"data": data};
	response.render(views_dir + 'page_overview.jade',
		_.extend({}, jade_options, locals));
});

////////////////////////////////////////////////////////////////////////////////
// START SERVER
////////////////////////////////////////////////////////////////////////////////

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});