
var graph, story,
    createGraph = function (jsonF, gcontainer, icontainer) {
        "use strict";
        story = new SigmaLayout(jsonF);
        graph = new sigma({
            graph: story,
            container: gcontainer,
            settings: {
                defaultNodeColor: "#ec5148",
                defaultLabelSize: 11
            },
            renderer: {
                container: gcontainer,
                type: "canvas"
            }
            
        });
        createInfoBox(icontainer);
        var dragListener = sigma.plugins.dragNodes(graph, graph.renderers[0]);
        dragListener.bind('startdrag', function(event) {
          console.log(event);
        });
        dragListener.bind('drag', function(event) {
          console.log(event);
        });
        dragListener.bind('drop', function(event) {
          console.log(event);
        });
        dragListener.bind('dragend', function(event) {
          console.log(event);
        });
    },
    
    createInfoBox = function (icontainer){
        var nodeInfoForm, nLabel, nodeLabel, targets, ctaLabel, contentArea;
        nodeInfoForm = document.createElement("form");
        nLabel = document.createElement("span");
        nodeLabel = document.createElement("input");
        targets = document.createElement("div");
        ctaLabel = document.createElement("span");
        contentArea = document.createElement("textarea");
        
        nLabel.innerHTML = "Node Label";
        nodeLabel.type = "text";
        
        targets.name = "targets";
        targets.id = "nodeTaregets";
        targets.style = "display:flex; flex-flow: column; ";
        
        ctaLabel.innerHTML = "Content of Node";
        contentArea.style.width = "100%";
        nodeInfoForm.appendChild(nLabel);
        nodeInfoForm.appendChild(nodeLabel);
        nodeInfoForm.appendChild(targets);
        nodeInfoForm.appendChild(ctaLabel);
        nodeInfoForm.appendChild(contentArea);
    
        icontainer.appendChild(nodeInfoForm);
        
        graph.bind('clickNode', function(e) {
            node = e.data.node;
            nodeLabel.value = node.label;
            setTargets(targets, node);
            contentArea.value = node.content;
            
        });
        

    };

    function setTargets(cont, node) {
        var tNode, sChoice, cLabel, sLabel;
        
        while(cont.firstChild){
            cont.removeChild(cont.firstChild);
        }
        
        graph.graph.edges().forEach(function (edge){
            
            if(edge.source === node.id || edge.id === node.id){
                cLabel = document.createElement("span");
                cLabel.innerHTML = "Choice";
                sLabel = document.createElement("span");
                sLabel.innerHTML = "Choice lead to";
                
                tNode = document.createElement("input");
                tNode.type = "text";
                tNode.name = "tNodes";
                tNode.list = "tNode";
                tNode.value = graph.graph.nodes(edge.target).label + " " +edge.count;
                
                sChoice = document.createElement("input");
                sChoice.type = "text";
                sChoice.value = edge.choice;
                
                cont.appendChild(cLabel);
                cont.appendChild(sChoice);
                cont.appendChild(sLabel);
                cont.appendChild(tNode);
            }

        });
    }
