
class Node {
	constructor(event, index, eventSize){
		this.id = 'n' + event.Event_id;
		this.label = event.Event_title;
		this.content = event.Event_Content;
		this.x = (index / eventSize);
		this.y = 0;
		this.size = 10;
	}
	
}
class Edge {
	constructor(branch, srcId, edgeSerial, jndex){
    this.id = 'e' + edgeSerial ;
    this.choice = branch.choice;
    this.source = 'n' + srcId;
    this.target = 'n' + branch.Next_event;
    this.type = "curvedArrow";
    this.count = jndex;
	}
    static generateEmptyEdge(nodeId){
        let branch = {
            choice:'',
            Next_event:nodeId.substr(1)
        },
        srcId = nodeId.substr(1),
        edgeSerial = graph.graph.getLastEdgeInedx(),
        jndex = graph.graph.getNumOfOutNighbors(nodeId);
        return new Edge(branch, srcId, edgeSerial, jndex);
    }
    static generateArgsFromEdge(edge){
        let branch = {
            choice:edge.choice,
            Next_event:edge.source.substr(1)
        },
        srcId = edge.source.substr(1),
        edgeSerial = edge.id.substr(1),
        jndex = edge.count;
        return [branch, srcId, edgeSerial, jndex];
    }
    static generateFromHEdge(edge){
        let newEdge = {};
        for (let prop in edge){
            newEdge[prop] = edge[prop];
        }
        delete newEdge.end;
        newEdge.target = newEdge.source;
        newEdge.id = newEdge.id.substr(1);
        return newEdge;
    }
}
class HEdge extends Edge{
	constructor(branch, srcId, edgeSerial, jndex){
		super(branch, srcId, edgeSerial, jndex);
		this.id = '-' + this.id;
		this.end = true;
	}
    static generateFromEdge(edge){
        let args = this.generateArgsFromEdge(edge);
        return new HEdge(args[0], args[1], args[2], args[3]);
    }
}
function constructGraph(events) {
    "use strict";
    let graph = {}, nodes = [], Hedges = [], Redges = [];

    if (events)
        events.forEach(function (event, index) {
			let node = new Node(event, index-1, events.length);
            nodes.push(node);
			event.Default_branch.forEach(function (branch, jndex){
			let edge, Hedge;
                if (branch.end) {
                    Hedge = new HEdge(branch, event.Event_id, Redges.length, jndex);
                    Hedges.push(Hedge);
                } else {
					edge = new Edge(branch, event.Event_id, Redges.length, jndex);
                    Redges.push(edge);

                }
			});
        });
	
    graph = {"nodes":nodes, "edges":Redges, "Hedges":Hedges};
    return graph;
}



class SigmaLayout {
	constructor(s){
    s = s || '';
	s.Events = s.Events || "";
	//if(s.hasOwnProperty('Events')){
	let graph = constructGraph(s.Events);
    this.nodes = graph.nodes;
    this.edges = graph.edges;
    this.endings = graph.Hedges;
	}
	getHedge(eid){
        let i = 0;
        for (i = 0; i < this.endings.length; i++){
            if(this.endings[i].id === eid){
                break;
           }
        }
        return this.endings[i];
    }
	removeHedge(id){
        for (let i = 0; i < this.endings.length; i++){ 
           if(this.endings[i].id === id){
               this.endings.splice(i, 1);
               return true;
           }
        }
        return false;
    }
	
}

