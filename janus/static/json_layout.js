class Event {
    constructor(node){
        this.Event_id = node.id.substr(1);
        this.Event_title = node.label;
        this.Event_Content = node.content;
        this.Default_branch = [];
    }
}
class Choice {
    constructor(edge){
    this.choice = edge.choice;
    this.Next_event = edge.target.substr(1);
    this.end = edge.end;
    }
}

class Story {
    constructor(graph){
    this.Events = this.setEvents(graph);
    }
    
    setEvents(graph) {
    let Events = [];
    graph.nodes().forEach(function (node) {
        Events.push(new Event(node));
    });
    graph.edges().forEach(function (edge) {
        let event = Events[Number.parseInt(edge.source.substr(1))];
        event.Default_branch.push(new Choice(edge));
    });
    story.endings.forEach(function (end){
        let event = Events[Number.parseInt(end.source.substr(1))];
        end.target = 'n' + graph.nodes().length;
        event.Default_branch.push(new Choice(end));
    });
    return Events;
}
}