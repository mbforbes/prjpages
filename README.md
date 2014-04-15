## TODO:
* simple path matching (express)
* launch
* make heroku commands to compile bootstrap and generate sass so that I don't track them. currently tracking that I don't want to:
  * public/css/bootstrap.min.css
  * public/js/bootstrap.min.js
  * public/fonts/*
  * public/css/pt_prj.css
However, this could be a little complicated because heroku would have to actually pull the bootstrap source because I don't want to track that either. Just compiling the scss would be a good start.

* add back in support for IE 8, etc. (see comments in views/head.jade)

## Notes:
* My phone's screen width is 360px, so that should be the minimum resolution width supported (if not smaller...)