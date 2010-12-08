//steal/js animatr/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('animatr/scripts/build.html',{to: 'animatr'});
});
