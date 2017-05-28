
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
    var nodes = [];
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
    var edges = [];
    events.forEach(function (event, index) {
        event.Default_branch.forEach(function (branch, jndex) {
            
            if (events[branch.Next_event]) {
                var edge = new Edge(jndex);
                edge.choice = branch.choice;
                edge.source = 'n' + event.Event_id;
                edge.target = 'n' + branch.Next_event;
                edge.id = 'e' + edges.length;
                edge.end = branch.end;
                edges.push(edge);
            }
        });
    });

    return edges;
}

function SigmaLayout(s) {
    "use strict";
    this.nodes = readNodes(s.Story.Events);
    this.edges = readEdges(s.Story.Events);
}

