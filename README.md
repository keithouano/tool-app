# tool-app


RAK TAXI App:   /setup/  > sudo npm install -g ionic@2.2.3
> sudo nom install -g cordova  /ios develop/ > sudo npm install -g ios-sim 
// to fix install ios-deploy issue by adding (—unsafe-per=true)
/*https://github.com/phonegap/ios-deploy/issues/186*/ > sudo npm install -g ios-deploy --unsafe-perm=true

/Missing icon Error ?/ >ionic resources ios

/install node modules/
> npm install 

/useful node commands, when asking questions/
* NPM version (npm -v)
* Node version (node -v)
* Node Process (node -p process.versions):
* Node Platform (node -p process.platform)
* Node architecture (node -p process.arch)
* node-sass version (node -p "require('node-sass').info"):


/Node Sass error ?/
/*https://github.com/sass/node-sass/issues/1764*/
> npm rebuild node-sass  /dev run web/ > ionic serve  /dev run iOS/
> ionic platform add ions /*if not added yet*/
> ionic run ios

/if plugin is changed via package.json/ > nm install —save
> ionic platform rm iOS

/Git/ git remote add origin https://github.com/keithouano/tool-app.git
git push -u origin master  


