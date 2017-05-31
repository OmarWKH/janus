
function Node(i) {
    "use strict";
    this.id = "";
    this.label = "";
    this.content = "";
	this.x = 0;
    this.y = 0;
	this.size = 10;
}
function Edge(j) {
    "use strict";
    this.id = "";
    this.choice = "";
    this.source = "";
    this.target = "";
    this.type = "curvedArrow";
    this.count = j + 1;
    this.end = false;
}
function readNodes(events) {
    "use strict";
    console.log("readNodes events: " + events);
    var nodes = [];
    if (events)
        events.forEach(function (event, index) {
            var node = new Node(index + 1);
            node.id = 'n' + event.Event_id;
            node.label = event.Event_title;
            node.content = event.Event_Content;
            node.x = (index / events.length);
            nodes.push(node);
        });
    return nodes;
}

function readEdges(events) {
    "use strict";
    var edges = [], Hedges = [], Redges = [];
    if(events)
        events.forEach(function (event, index) {
            event.Default_branch.forEach(function (branch, jndex) {
                var edge, Hedge;
                if (events[branch.Next_event]) {
                    edge = new Edge(jndex);
                    edge.choice = branch.choice;
                    edge.source = 'n' + event.Event_id;
                    edge.target = 'n' + branch.Next_event;
                    edge.id = 'e' + Redges.length;
                    edge.end = branch.end;
                    Redges.push(edge);
                } else if(branch.end){
                    Hedge = new Edge(jndex);
                    Hedge.choice = branch.choice;
                    Hedge.source = 'n' + event.Event_id;
                    Hedge.target = 'n' + branch.Next_event;
                    Hedge.id = '-e' + Hedges.length;
                    Hedge.end = true;
                    Hedges.push(Hedge);
                }
            });
        });
    edges.push(Redges);
    edges.push(Hedges);
    return edges;
}

function SigmaLayout(s) {
    "use strict";
    s = s || "";
    console.log("s: " + s);
    this.nodes = readNodes(s.Events);
    console.log("n: " + this.nodes);
    var E = readEdges(s.Events);
    this.edges = E[0] || [];
    this.endings = E[1] || [];
    this.removeHedge = function (id){
        for (let i = 0; i < this.endings.length; i++){ 
           if(this.endings[i].id === id){
               this.endings.splice(i, 1);
               return true;
           }
        }
        return false;
    }
    this.getHedge = function(eid){
        let i = 0;
        for (i = 0; i < this.endings.length; i++){
            if(this.endings[i].id === eid){
                break;
           }
        }
        console.log(this.endings[i]);
        return this.endings[i];
    }
}

