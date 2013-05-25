
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

	function AddFromFreebase() {
	
		//
		// The conversion from Wikipedia entry to Freebase topic name
		//
		function topicHeuristicConversion_wikipediaToFreebase(topic)
		{
			// TODO: remove /en/ hack
			var str = '/en/' + topic; 
			var topic_id = str.replace(/\s+/g,'_').toLowerCase(); // replaces all spaces with _ and turns all lowercase
			return topic_id	
		}
	
		if (topic = getTopic())
		{
			var result;
			log("Fetching data from freebase");
			var topic_id = topicHeuristicConversion_wikipediaToFreebase(topic)
			log(topic_id);
			var service_url = 'https://www.googleapis.com/freebase/v1/topic';
			
			$.getJSON(service_url + topic_id + '?callback=?') // the Ajax call to Google API
			.done(function(result) {
				//log(result.id);
				if (result.error)
				{
					log("Could not find equivalent Freebase topic (Google API response: " + JSON.stringify(result.error) + ")");
				}
				else
				{
					officialWebsiteText = result.property['/common/topic/official_website'];
					if (typeof officialWebsiteText !== 'undefined') {
						log("Determined website: " + officialWebsiteText.values[0].text);
						// TBD: stick into page's html with minorly cool styling
					}
					
					socialMediaPresence = result.property['/common/topic/social_media_presence'];
					if (typeof socialMediaPresence !== 'undefined') {
						for (var i=0; i<socialMediaPresence.count; i++) {
							log(socialMediaPresence.values[i].text) 
							// TBD: stick into page's html with minorly cool styling
						}
					}
				}
			})
			.fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ', ' + JSON.stringify(error);
				log("Failed receiving response from Google API for finding equivalent Freebase topic. This might be a network error (api error details: " + err + ")");
			});
		}
	
/*			//var query = [{'id':topic}];
			var query = [{'type':'/common/topic','id':topic}];
			//var query = [{'type':'/music/album','id':null,'name':null}];
			gapi.client.load('freebase', 'v1', function(){
				var request = gapi.client.freebase.mqlread({'query': JSON.stringify(query)});
				request.execute(function(response) {
					console.log(response);
//					var results = JSON.parse(response)['result'];
//                        $.each(results, function(i, topic) {
//                          log(topic['name']);
//                    });					
				});
			});
		}
*/		
	}		
	

	//
	// Callback for Google's javascript API having been loaded
	//
	function onLoad() {
		log("Loading specific Google API");
		gapi.client.setApiKey('AIzaSyDVH3vdQ0R7dv3uiOwMqF0vyHCpRfi6Tnw');
		gapi.client.load('freebase', 'v1', function(){ 
			log("Google freebase API loaded"); 
			AddFromFreebase();	
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
