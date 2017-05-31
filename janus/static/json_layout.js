function Event(node) {
    "use strict";
    this.Event_id = node.id.substr(1);
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
    graph.nodes().forEach(function (node) {
        Events.push(new Event(node));
    });
    graph.edges().forEach(function (edge) {
        let  event = Events[Number.parseInt(edge.source.substr(1))];
        if (event) {
            event.Default_branch.push(new Choice(edge));
        }
    });
    story.endings.forEach(function (edge){
        let  event = Events[Number.parseInt(edge.source.substr(1))];
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



