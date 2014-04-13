# Update bootstrap, build, and copy css/js/fonts.
cd public/bootstrap
git pull origin
grunt dist
cp dist/css/bootstrap.min.css ../css/
cp dist/js/bootstrap.min.js ../js/
cp dist/fonts/* ../fonts/
