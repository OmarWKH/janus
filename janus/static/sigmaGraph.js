
var graph, story, story_id, ibox,
init = function (storyID, jsonF, gC, iC){
    gC = document.getElementById(gC);
    iC = document.getElementById(iC);
    story_id = storyID;
    createSigmaInstance(jsonF, gC, iC);
},
createSigmaInstance = function (jsonF, gcontainer, icontainer) {
    "use strict";
    let jsonObj = JSON.parse(jsonF) || "";
    story = new SigmaLayout(jsonObj);
    sigma.classes.graph.addMethod('getLastEdgeInedx', function(){
            let maxEdgeId = 0;
            this.edgesArray.forEach(function(edge){
                if (Number.parseInt(edge.id.substr(1)) > maxEdgeId){
                    maxEdgeId = Number.parseInt(edge.id.substr(1));
                }
            });
            return maxEdgeId+1;
    });
    sigma.classes.graph.addMethod('getLastNodeIndex', function (){

        if (this.nodesArray.length > 0){
        let lastNodeID = this.nodesArray[this.nodesArray.length-1].id;
        return Number.parseInt(lastNodeID.substr(1))+1;
            }
        return 0;
    });
	sigma.classes.graph.addMethod('getEdgesByNodeId', function(nId){
        let edges = this.edgesArray.filter(function (edge){
               return edge.source === nId;
            });
        edges = edges.concat(story.endings.filter(function (edge){
                return edge.source === nId;
            }));
        return edges;
        });
    sigma.classes.graph.addMethod('getNumOfOutNighbors', function (srcId, tarId = srcId){
        let x = this.outNeighborsIndex[srcId][tarId], count = 1;
        for (let edge in x){
            count++;
        }
        return count; 
    });
    graph = new sigma({
        graph: story,
        container: gcontainer,
        settings: {
            defaultNodeColor: "#ec5148",
            defaultLabelSize: 11,
            doubleClickEnabled: false,
            immutable: false,
            minEdgeSize: 2
        },
        renderer: {
            container: gcontainer,
            type: "canvas"
        }

    });
    var dragListener = sigma.plugins.dragNodes(graph, graph.renderers[0]);

    graph.bind('doubleClickStage', function (e){
        console.log(graph.graph.nodes());
        let n = graph.graph.getLastNodeIndex(),
            event = {
                Event_id:n,
                Event_title:'',
                Event_Content:''
            },
            index = n+1;
        n = ((n===0)? 1 : n);
        graph.graph.addNode(new Node(event, index, n));
        graph.refresh();
    });
    graph.bind('doubleClickNode', function (e){
        graph.graph.dropNode(e.data.node.id);
        ibox.emptyContainer(ibox.parent);
        graph.refresh();
    });
    graph.bind('clickNode', function(e) {
        let node = e.data.node;
        ibox = new InfoBox(node, icontainer);
    });
	document.addEventListener('unload', function(e){
		save()
	});
    document.getElementById("saveBtn").addEventListener('click', function (e){
        save();
     });
};
function save(){
    let url = window.location.protocol + "//" + window.location.host + "/save_story",
        story = graph.graph,
        json = new Story(story),
        params = "json="+JSON.stringify(json);
    params = params + "&id="+story_id;
    httpPostAsync(url, params);
}
function httpPostAsync(url, params, callback=nullFallback) {
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
    console.log(JSON.stringify(new Story(graph.graph)));
}

function nullFallback(status, responseText) {
    console.log("response status: " + status);
    console.log("response text: " + responseText);
}

