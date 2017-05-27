function test() {
    "use strict";
    var container = document.getElementById("json_ting"),icontainer = document.getElementById("cont") ;
    createGraph(jsonFile, container, icontainer);
}

var jsonFile = {
            "Story": {
                    "id" : "STORY_ID",
                    "title": "Vengence",
                    "Author" : "Albaraa \"Vonrex\" Bajnaid",
                    "Events" : [
                            { "Event_id" : "0",
                              "Event_title" : "Pain",
                              "Event_Content" : "Here eyes … Full of tears, She’s Gasping for air now!.",
                              "Default_branch" : [
                                            {"choice" : "You ran to her out of chivalry to comfort her.", "Next_event": "1"},
                                            {"choice" : "You said “there there’, with the tip of your tongue, and continued your way.", "Next_event": "0"},
                                            {"choice" : "You just … left.", "Next_event": "2"}
                                         ]


                            },
                            { "Event_id" : "1",
                              "Event_title" : "EVENT_TITLE_1",
                              "Event_Content" : "TEXT_2",
                              "Default_branch" :  [ 
                                            { "choice" : "Choice_Text", "Next_event": "0" },
                                            { "choice" : "Choice_Text_2", "Next_event": "1" }
                                          ]
                            },
                            { "Event_id" : "2",
                              "Event_title" : "Anger",
                              "Event_Content" : "Behind your back, weird screeches started popping out, the crying stopped, the screeches transformed into crackling of teeth, painful.  The sound is getting closer and closer to you.",
                              "Default_branch" :  [ 
                                            { "choice" : "You ran like you’ve never ran before.", "Next_event": "0" },
                                            { "choice" : "You turned cowardly, yet curiously!.", "Next_event": "1" },
                                            { "choice": "You grabbed a stone from the ground beneath you, and turned to face the demon!.", "Next_event": "0"},
                                            { "choice" : "You kept walking as if nothing’s happened.", "Next_event": "3" }
                                          ]
                            },
                            {
                              "Event_id" : "3",
                              "Event_title" : "Death",
                              "Event_Content" : "A Scream pierced your ears, your bones started to shatter, your vision...Darkened.",
                              "Default_branch" :  [ 
                                            { "choice" : "The End", "Next_event": "3", "end" : true },
                                          ]
                            },
                             ]
                    }
            };