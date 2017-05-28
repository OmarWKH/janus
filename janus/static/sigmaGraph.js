
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
//        gcontainer.lastChild.addEventListener("click", function (e){
//            console.log(sigma.utils.getX(e));
//            var x = e.data.captor.clientX - gcontainer.offsetWidth / 2,
//                y = e.data.captor.clientY - gcontainer.offsetHeight / 2;
//            console.log(x + " " + y);
//            var p = graph.camera.cameraPosition(x, y);
//            console.log(p.x + " " +p.y);
//            graph.graph.addNode({
//                id: graph.graph.nodes().length,
//                size: 3,
//                x: x,
//                y: y
//            });
//            graph.refresh();  
//        })
        graph.bind('clickStage', function (e){
            var n = graph.graph.nodes().length + 1;
            console.log((n+1) / n);
            
            
            graph.graph.addNode({
                id: 'n' + n,
                size: 10,
                x: (n+1) / n,
                y: 0
            });
            graph.refresh();
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
            nodeLabel.addEventListener('change', function(e){
               node.label = nodeLabel.value; 
            });
            setTargets(targets, node);
            contentArea.value = node.content;
            contentArea.addEventListener('change', function(e){
               node.content = contentArea.value; 
            });
            
        });
        

    };

    function setTargets(cont, node) {
        var choiceDiv, tNode, sChoice, cLabel, sLabel, removeBtn, addBtn, addChoice, cDatalist, Nodes, Edges;
        
        Nodes = graph.graph.nodes;
        Edges = graph.graph.edges;
        

        
        while(cont.firstChild){
            cont.removeChild(cont.firstChild);
        }

        Edges().forEach(function (edge){
            if(edge.source === node.id){
                createChoiceElements();
                tNode.value = Nodes(edge.target).label;
                tNode.id = edge.target;
                
//                tNode.addEventListener('change', function (e){
//                    
//                });
                sChoice.value = edge.choice;
                sChoice.id = edge.target;
                
                appendChoiceElements();
            }
        });
        addBtn = document.createElement("div");
        addBtn.innerHTML = "+";
        addBtn.style = "color: green;";
        addBtn.addEventListener('click', function (e){
            createChoiceElements();
            appendChoiceElements();
            cont.insertBefore(cont.lastChild, addBtn);
        });
        cont.appendChild(addBtn);
        function createChoiceElements(){
            choiceDiv = document.createElement("div");
            choiceDiv.style = "display: flex; flex-flow: row;";

            cLabel = document.createElement("span");
            cLabel.innerHTML = "Choice";

            sLabel = document.createElement("span");
            sLabel.innerHTML = "Choice lead to";

            tNode = document.createElement("select");
            tNode.class = "tNodes";
            Nodes().forEach(function (e, i){
                var op = document.createElement("option");
                op.text = e.label;
                op.id = e.id;
                tNode.options.add(op, i);
            });
            
            sChoice = document.createElement("input");
            sChoice.type = "text";
            
            removeBtn = document.createElement("span");
            removeBtn.innerHTML = "X";
            removeBtn.style = "color: red; background-color: black;";
            removeBtn.addEventListener("click", function(e){
               cont.removeChild(this.parentElement);
            });
        }
        function appendChoiceElements(){
            choiceDiv.appendChild(cLabel);
            choiceDiv.appendChild(sChoice);
            choiceDiv.appendChild(sLabel);
            choiceDiv.appendChild(tNode);
            choiceDiv.appendChild(removeBtn);
            cont.appendChild(choiceDiv);
        }
    }
