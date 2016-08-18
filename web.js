////////////////////////////////////////////////////////////////////////////////
// LOAD AND CONFIGURE MODULE DEPENDENCIES
////////////////////////////////////////////////////////////////////////////////

// Load module dependencies
var express = require("express");
var logger = require("morgan");
var fs = require("fs");
var _ = require('underscore');
var highlight = require('highlight.js');
var CSON = require('cson');
// var jade = require("jade");
var md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && highlight.getLanguage(lang)) {
      try {
        return highlight.highlight(lang, str).value;
      } catch (__) {}
    }

    return ''; // use external default escaping
  },
  html: true,
  linkify: true,
  typographer: true
});
md.use(require("markdown-it-anchor"));
md.use(require("markdown-it-footnote"));

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
var thanksfile = 'thanks.md'; // end of posts (past footnotes)
var pub_dir = __dirname + '/public/';
var views_dir = pub_dir + 'views/';
var data_dir = pub_dir + 'data/';
var local_data_dir = '/data/';
var other_dir = data_dir + 'other/';
var prj_dir = data_dir + 'projects/';
var research_dir = data_dir + 'research/';
var cat_dir = data_dir + 'categories/';

////////////////////////////////////////////////////////////////////////////////
// CONFIGURE SERVER
////////////////////////////////////////////////////////////////////////////////

// Pimp my string (from
// http://stackoverflow.com/questions/280634/endswith-in-javascript)
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
};

// for calling in _ loop
var endsWithThis = function(str) {
	return str.endsWith(this);
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
		return CSON.load(file_path);
	} else {
		console.warn('File ending not implemented for: ' + file_path);
	}
};

// generate the project names / icons array by loading from the filesystem
var genCatsForDir = function(dirname) {
	var c1 = fs.readdirSync(dirname);
	var candidates = _.filter(fs.readdirSync(dirname),
		function(f) {
			return fs.statSync(dirname + f).isDirectory() &&
				fs.existsSync(dirname + f + '/' + propfile);
		});
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

// Scans all categories within basedir (either projects or research) and gets
//  all item objects within directories it finds.
var loadItems = function(basedir, section, cats) {
	var results = [];
	for (var i = 0; i < cats.length; i++) {
		var cat = cats[i];
		// Find all possible project/research entries within a project /
		// research category
		var catdir = basedir + cat.name + '/';
		var candidates = _.filter(fs.readdirSync(catdir),
			isDirectoryPrefix,
			catdir);
		for (var j = 0; j < candidates.length; j++) {
			// For each entry (candidate), see if it contains an item.cson file
			var candidate = candidates[j];
			var candidatedir = catdir + candidate + '/';
			var candidatefiles = fs.readdirSync(candidatedir);
			var itemfiles = _.filter(candidatefiles, equalToThis, itemfile);
			if (itemfiles.length >= 1) {
				// We've found an itemfile. Load that, and then we'll load any
				// additional data (e.g. markdown posts).

				// We just use the first if there's more than one itemfile.
				var itemname = itemfiles[0];
				newitem = loadFile(candidatedir + itemname);
				newitem.section = section;
				newitem.cat = cat.name;
				newitem.name = candidate;
				// Adjust image to correct path if necessary.
				if (!newitem.img_src.startsWith('http') && // not for external
					!newitem.img_src.startsWith('/')) { // not for absolute
					newitem.img_src = local_data_dir + section + '/' +
						cat.name + '/' + candidate + '/' + newitem.img_src;
				}

				// Load additional data here (markdown posts, etc.).

				// The contents are all loaded as the "post".
				var contents = [
					postfile,
					thanksfile,
				];
				var post = '';
				for (var ci = 0; ci < contents.length; ci++) {
					var f = _.filter(candidatefiles, endsWithThis, contents[ci]);
					if (f.length > 1) {
						console.log("Warning! Found > 1 file for " + contents[ci] + " for " + cat);
					}
					if (f.length === 0) {
						continue;
					}
					post +=  md.render(fs.readFileSync(candidatedir + f[0],
						{encoding: 'utf8'}));
				}
				newitem.post = post;

				// Finished; add to results.
				results.push(newitem);
			}
		}
	}
	return results;
};

// simple function to get the property of an object ('passed' as context)
var getProp = function(obj) {
	return obj[this];
};

////////////////////////////////////////////////////////////////////////////////
// LOAD ALL OF THE DATA
////////////////////////////////////////////////////////////////////////////////

// Grab all project and research categories and items.
var prj_cats = genCatsForDir(prj_dir);
var research_cats = genCatsForDir(research_dir);
var prj_jsons = loadItems(prj_dir, 'projects', prj_cats);
var research_jsons = loadItems(research_dir, 'research', research_cats);

// This is passed to the renderer.
var data = {
	"prj_cats": prj_cats,
	"research_cats": research_cats,
	"prj_jsons": prj_jsons,
	"research_jsons": research_jsons,
};

// Additional data for other sections.
var about_post = md.render(fs.readFileSync(other_dir + "about.md",
	{encoding: 'utf8'}));

// Further processing for routing.
var ok_cats = _.map(prj_cats.concat(research_cats), getProp, 'name');
var all_jsons = prj_jsons.concat(research_jsons);

// Basic reporting for debugging.
console.log("projects: " + prj_jsons.length);
console.log("research: " + research_jsons.length);
//console.log(data);

////////////////////////////////////////////////////////////////////////////////
// CONFIGURE SERVER
////////////////////////////////////////////////////////////////////////////////

//app.use(logger());
app.use(express.static(pub_dir));
app.locals._ = require("underscore");

////////////////////////////////////////////////////////////////////////////////
// RENDER FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

var render_root = function(request, response) {
	var locals = {"data": data};
	response.render(views_dir + 'page_overview.jade',
		_.extend({}, jade_options, locals));
};

var render_cat = function(request, response) {
	var cat = request.params.cat;
	if (ok_cats.indexOf(cat) > -1) {
		// valid category; render category
		var locals = {"data": data, "activecat": cat};
		response.render(views_dir + 'page_overview.jade',
			_.extend({}, jade_options, locals));
	} else {
		// default: render root
		render_root(request, response);
	}
};

// not called directly---called from other functions if the section
var render_projects = function(request, response) {
	var locals = {"data": data, "activesection": 'projects'};
	response.render(views_dir + 'page_overview.jade',
		_.extend({}, jade_options, locals));
};

var render_item = function(request, response) {
	var cat = request.params.cat,
		item = request.params.item,
		activeitem;
	if (ok_cats.indexOf(cat) > -1) {
		// good cat! at least render cat (maybe even item)
		activeitem = _.findWhere(all_jsons, {name: item, cat: cat});
		if (activeitem) {
			// good item!
			var locals = {
				"data": data,
				"activecat": cat,
				"activeitem": activeitem
			};
			response.render(views_dir + 'page_post.jade',
				_.extend({}, jade_options, locals));
		} else {
			// bad item; just render cat
			render_cat(request, response);
		}
	} else {
		// bad cat; render root
		render_root(request, response);
	}
};

////////////////////////////////////////////////////////////////////////////////
// CONFIGURE ROUTING
////////////////////////////////////////////////////////////////////////////////

app.get('/about', function(request, response) {
	var locals = {
		"data": data,
		"activecat": "about",
		"about_post": about_post
	};
	response.render(views_dir + 'page_about.jade',
		_.extend({}, jade_options, locals));
});

app.get('/projects', render_projects);

app.get('/:cat/:item', render_item);

app.get('/:cat', render_cat);

app.get('/', render_root);

////////////////////////////////////////////////////////////////////////////////
// START SERVER
////////////////////////////////////////////////////////////////////////////////

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
