var save = {'last_event': '', 'path': []};
var story;
function player(story_id, story_json, db_save) {
    let expiration_days = 10;

    this.init = function(story_id, story_json, db_save){
        window.addEventListener("load", start);
        console.log("DB Save:");
        console.log(db_save);

        console.log("Starting...");
        this.story_json = story_json;
        story = JSON.parse(story_json);
        story.id = story_id
        console.log("JSON file parsed...");
        console.log(story);
        
        // DB save for the requested story is passed to the function, if it exists
        // this.db_save = db_save;
        // TO-DO: 
        // - use db_save if it exists
        // - save via POST request to /save_checkpoints
    }

    function saveProg(event_id){
        console.log('Saving...');
        save.last_event = event_id;
        save.path.push(event_id);
        saveProgViaCookies();
    }

    function loadFromDB(){
        console.log(db_save);
        if(db_save !== null){
            save = JSON.parse(db_save);
            return save['last_event'];
        }else{
            return 0;
        }
    }

//     function saveToDB(){
//         let http = new XMLHttpRequest();
//         let saves_json = JSON.parse(saves);
//         saves_json.story.Story.id = save;
//         let url = "/save_checkpoints";
//         let params = JSON.stringify(saves_json);
//         http.open("POST", url, true);
//
// //Send the proper header information along with the request
//         http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//
//         http.onreadystatechange = function() {//Call a function when the state changes.
//             if(http.readyState == 4 && http.status == 200) {
//                 alert(http.responseText);
//             }
//         }
//         http.send(params);
//     }

    function loadSaveFromCookies(){
        let saves = getCookie("saves");
        if( saves !== ''){
            saves_json = JSON.parse(saves);
            let storyID = story.id;
            if( saves_json.hasOwnProperty(storyID)) {
                console.log(save);
                let load = confirm('We Detected an old save, do you want to load it?, Note: Canceling will overwrite the save');
                if(load) {
                    console.log(saves_json[storyID]);
                    save = saves_json[storyID];
                    console.log('Loading....');
                    console.log(save['last_event']);
                    return save['last_event'];
                }
                else{
                    return 0;
                }
            }else
                return 0;

        }else
            return 0
    }

    function saveProgViaCookies(){

        let saves_cookie = getCookie("saves");
        let saves_json = {};
        if(saves_cookie !== '') {
            saves_json = JSON.parse(getCookie("saves"));
            console.log(saves_json);
            saves_json[story.id] = save;

            setCookie("saves",JSON.stringify(saves_json),expiration_days);
        }else {
            let story_id = story.id;
            saves_json[story_id] =  save;
            setCookie("saves",JSON.stringify(saves_json),expiration_days);
        }

    }

    this.start = function(story_json){
        // let target_event = loadSaveFromCookies();
        let target_event = loadFromDB();
        this.load_event(target_event);
    }

    this.load_event = function(id){
        console.log("story id: " + story.id);
        console.log("event id: " + id);
        let event_id = story.Story.Events[id].Event_id;
        let event_title = story.Story.Events[id].Event_title;
        saveProg(event_id);
        document.getElementById("E_data").innerHTML =
            "<h4>" + event_id + ":" + event_title + "</h4>";

        let event_text = story.Story.Events[id].Event_Content;
        console.log(event_text);
        document.getElementById("E_text").innerHTML =
            "<p>" + event_text + "</p>";

        document.getElementById("E_choices").innerHTML = "";
        console.log(story.Story.Events[id].Default_branch);
        let branches = story.Story.Events[id].Default_branch;
        for(i = 0; i < branches.length; i++){
            console.log(branches[i]);
            choice(branches[i]);
        }

        clearFeedback();
    }

    this.choice = function(branch){
        console.log(branch.choice);
        let choice_text = branch.choice;
        let choice_target = branch.Next_event;
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
        console.log("Save:");
        console.log(save);
        console.log(document.cookie);
    }

    function  getSaves(){
        return saves;
    }
    function setSaves(nsaves){
        saves = nsaves;
    }

    function getSave(){
        return save;
    }

    function setSave(nsave){
        save = nsave;
    }

    init(story_id, story_json, db_save);
}


function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function saveToDB(){
    let saves_cookie = getCookie("saves");
    let saves_json = {};
    saves_json = JSON.parse(saves_cookie);
    saves_json[story.id] = save;
    let url = window.location.protocol + "//" + window.location.host + "/save_checkpoints";
    let params = "saves="+JSON.stringify(saves_json);
    console.log(params);
    httpPostAsync(url, params, saveFeedbackCallback);
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

function httpPostAsync(url, params, callback) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        const done = 4;
        if (xmlHttp.readyState == 4) {
            callback(xmlHttp.status, xmlHttp.responseText);
        }
    }
    let async = true;
    console.log(url);

    xmlHttp.open("POST", url, async);
    console.log("Connection Opened");
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    console.log("RequestHeader Set.");
    xmlHttp.send(params);
    console.log("Request Sent.");
}

function saveFeedbackCallback(status, httpResponse){
    let forbidden_status = 403;
    let create_status = 201;
    let feedback = "";

    switch (status) {
        case forbidden_status: // when user is not logged in
            feedback = "Forbidden: " + httpResponse;
            break;
        case create_status: // when user is logged in, httpResponse is json, each story id and its save status (created/updated/ignored)
            feedback = "Create: " + httpResponse;
            break;
        default: // unknown, shouldn't happen
            feedback = "Status|Response: " + status + " | " + httpResponse;
    }

    addFeedback(feedback);
}

function addFeedback(feedback) {
    let container = document.getElementById("Save_feedback");
    feedbackHTML = "<li>"+feedback+"</li>";
    container.innerHTML += feedbackHTML;
}

function clearFeedback() {
    document.getElementById("Save_feedback").innerHTML = "";
}

function callbackFunction(status, httpResponse){
    console.log("Callback:");
    console.log("Status " + status);
    console.log(httpResponse);
}
