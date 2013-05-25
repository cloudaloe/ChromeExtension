
function log(text) {
	console.log(">> Chrome Augmenter Extension: " + text);
}

//
// contents of this function will be injected into the browser document's global 
// context, so that the Google API loading callback can start things off.
//
function injectedCode()
{
	function log(text) {
		console.log(">> Chrome Augmenter Extension injected script: " + text);
	}

	function getTopic() {
		var topic = document.querySelectorAll("h1");
		if (topic.length == 0) {
			log("Unexpected parsing result: no h1 header found");
			return null;
		}
		if (topic.length > 1) {
			log("Unexpected parsing result: more than one h1 header found");
			return null;
		}
		else {
			log("Detected topic " + topic[0].textContent);
			return topic[0].textContent;
		}
	}

	function Go() {
		if (topic = getTopic())
		{
			
		}
	}

	//
	// Callback for Google's javascript API having been loaded
	//
	function onLoad() {
		log("Loading specific Google API");
		gapi.client.setApiKey('AIzaSyDVH3vdQ0R7dv3uiOwMqF0vyHCpRfi6Tnw');
		gapi.client.load('freebase', 'v1', function(){ 
			log("Google freebase API loaded"); 
			Go();	
		});
	}
}

//
// Inject javascript code into global context
//
function injectJavascript(func) {

  // getting the function's source code content 
  var text = func.toString();
  var codeToPush = text.substr(text.indexOf("{")+1, text.lastIndexOf("}")-text.indexOf("{")-2); 

  // injecting that code
  var elem = document.createElement('script');
  elem.textContent = codeToPush;
  document.getElementsByTagName("head")[0].appendChild(elem);  
}

// 
// Dynamically load a remote javascript file
//
function loadjs(filename){
  var elem=document.createElement('script')
  elem.setAttribute("type","text/javascript")
  elem.setAttribute("src", filename)
  document.getElementsByTagName("head")[0].appendChild(elem)  
}

//
// Load Google's basic javascript API.
// Specific Google API needs to be called after this passed.
//
function loadGoogleApi(){
// TODO: Check for and handle api load error. Not clear if Google cleanly allows that.
	log("about to load Google API");
	loadjs("https://apis.google.com/js/client.js?onload=onLoad");
	log("loaded Google basic javascript API");
}

injectJavascript(injectedCode);
loadGoogleApi();
