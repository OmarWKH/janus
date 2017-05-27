
var graph, story;

function createGraph(jsonF, container) {
    "use strict";
    story = new SigmaLayout(jsonF);

    graph = new sigma({
        graph: story,
        container: "json_ting",
        settings: {
            defaultNodeColor: "#ec5148",
            defaultLabelSize: 11
        },
        renderer: {
            container: container,
            type: 'canvas'
        }

    });
}


//    window.addEventListener('keydown', addANode, false);
//    window.addEventListener('mousemove', updateMousePos, false);

//still in progress
//function addANode(event){
//    
//    if (event.keyCode == 107){
//        var n = graph.graph.nodes().length;
//        graph.graph.addNode({
//        id: 'n' + n,
//        size: 3,
//        x: mouseX / n,
//        y: mouseY
//        });
//    graph.refresh();
//    }
//}
//function updateMousePos(event){
//    mouseX = event.offsetX;
//    mouseY = event.offsetY;
//}