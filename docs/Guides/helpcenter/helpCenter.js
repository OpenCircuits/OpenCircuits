// in Ex2 to Ex6, change the name of the following function properly

function search() {

	/*
	"<a href='http://docs.opencircuits.io/' target='_blank'>Introduction</a>"
	"<a href='http://docs.opencircuits.io/GettingStarted/Installation/index.html' target='_blank'>Installation</a>"
	"<a href='http://docs.opencircuits.io/GettingStarted/Running/index.html#backend' target='_blank'>Running</a>"
	"<a href='http://docs.opencircuits.io/Guides/AddingNewComponents' target='_blank'>Add new components</a>"
	"<a href='http://docs.opencircuits.io/Guides/CheatSheets' target='_blank'>CheatSheets</a>"
	"<a href='http://docs.opencircuits.io/Guides/GoCrashCourse' target='_blank'>Go Crash Course</a>"
	"<a href='http://docs.opencircuits.io/test' target='_blank'>Style Guide</a>"
	"<a href='http://docs.opencircuits.io/ts/app/Overview' target='_blank'>App docs</a>"
	"<a href='http://docs.opencircuits.io/Other/References/Analog/UsingNGSpice' target='_blank'>Using NGSpice</a>"
	"<a href='http://docs.opencircuits.io/Other/References/GAuthSetup' target='_blank'>GAuth setup</a>"
	"<a href='http://docs.opencircuits.io/Other/References/GCPDatastoreSetup' target='_blank'>GCP datastore setup</a>"
	"<a href='http://docs.opencircuits.io/Other/DesignDocs/Template' target='_blank'>Design Docs template</a>"
	
	*/
  const entries = ["<a href='http://docs.opencircuits.io/' target='_blank'>Introduction</a>",
					"<a href='http://docs.opencircuits.io/GettingStarted/Installation/index.html' target='_blank'>Installation</a>",
					"<a href='http://docs.opencircuits.io/GettingStarted/Running/index.html#backend' target='_blank'>Running</a>",
					"<a href='http://docs.opencircuits.io/Guides/AddingNewComponents' target='_blank'>Add new components</a>",
					"<a href='http://docs.opencircuits.io/Guides/CheatSheets' target='_blank'>CheatSheets</a>",
					"<a href='http://docs.opencircuits.io/Guides/GoCrashCourse' target='_blank'>Go Crash Course</a>",
					"<a href='http://docs.opencircuits.io/test' target='_blank'>Style Guide</a>",
					"<a href='http://docs.opencircuits.io/ts/app/Overview' target='_blank'>App docs</a>",
					"<a href='http://docs.opencircuits.io/Other/References/Analog/UsingNGSpice' target='_blank'>Using NGSpice</a>",
					"<a href='http://docs.opencircuits.io/Other/References/GAuthSetup' target='_blank'>GAuth setup</a>",
					"<a href='http://docs.opencircuits.io/Other/References/GCPDatastoreSetup' target='_blank'>GCP datastore setup</a>",
					"<a href='http://docs.opencircuits.io/Other/DesignDocs/Template' target='_blank'>Design Docs template</a>",
					"<a href='http://docs.opencircuits.io/Other/References/Analog/Fall2019Research' target='_blank'>Fall 2019 Research</a>"];
  // get the input string
  var keywordString = document.getElementById("keyword").value;
  // set the flag for searching result 
  var foundFlag = false;
  document.getElementById("output").innerHTML = "";
  var resultStr = "";
  // search within the static array for matching keyword
  for(var i = 0; i < entries.length && (keywordString != "" && keywordString !=" "); i++){
	  if((entries[i].toUpperCase()).includes(keywordString.toUpperCase())){
		  //document.getElementById("output").innerHTML = document.getElementById("output").innerHTML + entries[i] + "<br>"; 
		  resultStr = resultStr + entries[i] + "<br>";
		  foundFlag = true;
	  }
  }
  if(!foundFlag){
	  document.getElementById("output").innerHTML = "No result found!!!"; 	  
  } else {
	  document.getElementById("output").innerHTML = resultStr;
  }
  
}
