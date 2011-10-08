binary_version=1.1.7

rm -rf ../firefox-build
rm ../HtmlUnitScripter-$binary_version.xpi
svn export . ../firefox-build/
cd ../firefox-build
zip -r ../HtmlUnitScripter-$binary_version.xpi . 
cd ../
