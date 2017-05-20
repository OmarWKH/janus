function player() {
	// window.addEventListener("load", start);
	
	this.start = function(story_json){
		 console.log("Starting...");
		 this.story = JSON.parse(story_json);
		 console.log("JSON file parsed...");
		 load_event(0);
	}

	this.load_event = function(id){
		var author = this.story.Story.Author;
		console.log(author);
		var event_id = this.story.Story.Events[id].Event_id;
		var event_title = this.story.Story.Events[id].Event_title;
		document.getElementById("E_data").innerHTML = 
		"<h4>" + event_id + ":" + event_title + "</h4>";

		var event_text = this.story.Story.Events[id].Event_Content;
		console.log(event_text);
		document.getElementById("E_text").innerHTML = 
		"<p>" + event_text + "</p>";

		document.getElementById("E_choices").innerHTML = "";
		console.log(this.story.Story.Events[id].Default_branch);
		var branches = this.story.Story.Events[id].Default_branch;
		for(i = 0; i < branches.length; i++){
				console.log(branches[i]);
				choice(branches[i]);
		}
	}

	this.choice = function(branch){
		console.log(branch.choice);
		var choice_text = branch.choice;
		var choice_target = branch.Next_event;
		console.log(choice_target);
		if( branch.end === true){
				document.getElementById("E_choices").innerHTML += 
		"<button type=\"button\" title=\"" + choice_text + 
		 "\" onClick=\"end_event("+
		 choice_target+")\">"+choice_text+"</button><br>"
		}else {
				document.getElementById("E_choices").innerHTML += 
				"<button type=\"button\" title=\"" + choice_text + 
				"\" onClick=\"load_event("+
				choice_target+")\">"+choice_text+"</button><br>";
		}
	}

	this.end_event = function(id){
		 console.log("Story ended at Event: "+id);
	}

	return this.start;
}

function request_story(id) {
	let url = window.location.protocol + "//" + window.location.host + "/story_json/" + id;
	httpGetAsync(url, player());
}

// https://stackoverflow.com/a/4033310
// alt: fetch https://stackoverflow.com/a/38297729
function httpGetAsync(url, callback) {
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		const done = 4;
		const ok = 200;
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(xmlHttp.responseText);
		}
	}
	let async = true;
	console.log(url);
	xmlHttp.open("GET", url, async);
	xmlHttp.send();
}
