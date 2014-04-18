# maxforbes.com

I created this website using a slew of technologies, none of which I paid for (because they're free), and all of which deserve thanks. They are:
- node.js
	- npm
	- colors
	- express
	- jade
	- merge
	- underscore
	- morgan
	- marked
	- highlight
	- cson
- markdown
- heroku
- sublime
- github
- bootstrap
- sass

Here's some other crap with which we should test out markdown

## Some text

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id turpis et tellus congue euismod. Phasellus gravida sagittis feugiat. Vivamus in tincidunt mi, nec porttitor magna. Etiam in diam nec erat varius elementum in vel elit. Etiam odio ligula, ullamcorper ut erat non, ultricies gravida erat. Ut condimentum nisi dui, ac pellentesque enim rhoncus sed. Nullam in pretium sem. Mauris non nisl pulvinar, iaculis purus ac, rutrum ipsum. Sed gravida posuere nisi ut aliquet. Nulla porttitor eros nunc, ac aliquet lacus vulputate sit amet.

Duis cursus, ligula a eleifend sagittis, quam eros lobortis risus, ut rutrum sapien nulla in metus. Nullam fermentum felis ante, at faucibus felis adipiscing non. Maecenas aliquam ipsum et libero bibendum, eu condimentum lorem molestie. Pellentesque fermentum ante id vehicula volutpat. Aenean id diam justo. Ut turpis diam, egestas consectetur cursus quis, bibendum in eros. Cras et turpis tortor. Maecenas sodales vehicula turpis, vel porttitor purus scelerisque quis. Pellentesque aliquet, arcu vel sollicitudin porta, tortor risus lacinia ante, quis lobortis lectus nunc ut neque. Maecenas ac dui vehicula, auctor lectus non, volutpat erat. Suspendisse potenti. Nunc sagittis dolor sit amet elementum auctor.

Image: 

![Picture of a robot](../images/robot.jpg)

Sed cursus risus mi, eget viverra lacus tincidunt eget. Donec ac nulla in augue laoreet suscipit. Phasellus consequat ipsum eget enim hendrerit, et porta quam luctus.

Duis et neque viverra, congue ligula et, ornare mauris. Maecenas iaculis adipiscing nisl, viverra bibendum mi rhoncus consequat. Pellentesque rutrum lobortis euismod. Etiam porttitor quam et metus adipiscing vulputate. Donec aliquam vestibulum justo, eget bibendum magna. In tempus ut turpis et hendrerit. Donec mattis enim sed auctor lobortis.

## Some code

Code is so great! Here we go!

```javascript
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
```

I wonder if markdown would work?
```Markdown
# Here's an example structure
[this](link addr) is a link boy
cd
cp
rm
- maybe
	- some nested
	- bullets
		- woah!

*what's* some other _crazy_ stuff?? & it gets better! &theta;
```

## That's not all
contact me for more info at [my email addr.](example@example.com).
