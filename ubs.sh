# Update bootstrap, build, and copy css/js.
cd public/bootstrap
git pull origin
grunt dist
cp dist/css/bootstrap.min.css ../css/bootstrap.min.css
cp dist/js/bootstrap.min.js ../js/bootstrap.min.js
