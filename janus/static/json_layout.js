function Event(node, i) {
    "use strict";
    this.Event_id = ""+i;
    this.Event_title = node.label;
    this.Event_Content = node.content;
    this.Default_branch = [];
}
function Choice(edge) {
    "use strict";
    this.choice = edge.choice;
    this.Next_event = edge.target.substr(1);
    this.end = edge.end;
}

function setEvents(graph) {
    "use strict";
    var Events = [];
    graph.nodes().forEach(function (node, i) {
        console.log("event:" + node.id + " index"+ i)
        Events.push(new Event(node, i));
    });
    graph.edges().forEach(function (edge) {
        let nodeIndex = graph.nodes().indexOf(edge.source);
        let  event = Events[nodeIndex];
        if (event) {
            event.Default_branch.push(new Choice(edge));
        }
    });
    story.endings.forEach(function (edge){
        let nodeIndex = graph.nodes(edge.source);
        console.log(nodeIndex + " " + edge.source);
        let  event = Events[nodeIndex];
        let n = graph.nodes().length;
        edge.target = 'e'+ n;
        if (event) {
            event.Default_branch.push(new Choice(edge));
        }
    });
    return Events;
}

function Story(graph) {
    "use strict";
    this.Events = setEvents(graph);
    
}



