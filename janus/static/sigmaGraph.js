
var graph, story,
    createGraph = function (jsonF, gcontainer, icontainer) {
        "use strict";
        story = new SigmaLayout(jsonF);
        
        sigma.classes.graph.addMethod('getLastEdgeInedx', function(){
            var lastEdgeID = this.edgesArray[this.edgesArray.length-1].id;
            return Number.parseInt(lastEdgeID.substr(1));
        });
        
        graph = new sigma({
            graph: story,
            container: gcontainer,
            settings: {
                defaultNodeColor: "#ec5148",
                defaultLabelSize: 11,
                doubleClickEnabled: false,
                immutable: false
            },
            renderer: {
                container: gcontainer,
                type: "canvas"
            }
            
        });

        createInfoBox(icontainer);
        var dragListener = sigma.plugins.dragNodes(graph, graph.renderers[0]);

        graph.bind('doubleClickStage', function (e){
            var n = graph.graph.nodes().length + 1;
            
            graph.graph.addNode({
                id: 'n' + n,
                size: 10,
                x: (n+1) / n,
                y: 0,
                label: '',
                content: ''
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
        
//        endSpan.innerHTML = "Is this an Ending Node";
//        endBox.type = "checkbox";
        
        nodeInfoForm.appendChild(nLabel);
        nodeInfoForm.appendChild(nodeLabel);
        nodeInfoForm.appendChild(targets);
        nodeInfoForm.appendChild(ctaLabel);
        nodeInfoForm.appendChild(contentArea);
    
        icontainer.appendChild(nodeInfoForm);
        
        graph.bind('clickNode', function(e) {
            node = e.data.node;
            nodeInfoForm.id = node.id;
            nodeLabel.value = node.label;
            nodeLabel.addEventListener('change', function(e){
                node.label = nodeLabel.value;
                graph.refresh();
            });
            setTargets(targets, node);
            contentArea.value = node.content;
            contentArea.addEventListener('change', function(e){
                node.content = contentArea.value;
                graph.refresh();
            });

        });
        graph.bind('doubleClickNode', function (e){
            graph.graph = graph.graph.dropNode(e.data.node.id);
            graph.refresh();
        });
        
    };

    function setTargets(cont, node) {
        var choiceDiv, tChoices = [], tNode, sChoice, cLabel, sLabel, removeBtn, addBtn, addChoice, endBox, endSpan, Nodes, Edges;
        
        Nodes = graph.graph.nodes;
        Edges = graph.graph.edges;
        
        while(cont.firstChild){
            cont.removeChild(cont.firstChild);
        }
        Nodes().forEach(function (n, i){
            var op = document.createElement("option");
            op.text = n.label;
            op.value = n.id;
            tChoices.push(op);
        });

        Edges().forEach(function (edge){
            if(edge.source === node.id){
                createChoiceElements();
                tNode.value = Nodes(edge.target).id;
                tNode.name = edge.id;
                changeEdges(tNode);
                
                sChoice.value = edge.choice;
                sChoice.name = edge.id;
                changeChoice(sChoice);
                appendChoiceElements();
            }
        });
        addBtn = document.createElement("div");
        addBtn.innerHTML = "+";
        addBtn.style = "color: green;";
        addBtn.addEventListener('click', function (e){
            createChoiceElements();
            tNode.value = '';
            changeEdges(tNode);
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
            
            tChoices.forEach(function (o, i){
                var op = o.cloneNode(true);
                tNode.appendChild(op, i);
            });
            
            sChoice = document.createElement("input");
            sChoice.type = "text";
            
            endBox = document.createElement("input");
            endBox.type = "checkbox";
            
            endSpan = document.createElement("span");
            endSpan.innerHTML = "is this an Ending Choice";
            
            endBox.addEventListener('change', function (e){
                if(e.srcElement.checked){
                    
                }
            })
            removeBtn = document.createElement("span");
            removeBtn.innerHTML = "X";
            removeBtn.style = "color: red; background-color: black;";
            removeBtn.addEventListener("click", function(e){
                var eID = e.path[1].getElementsByTagName("select")[0].name;
                if(eID){
                    graph.graph.dropEdge(eID);
                    }
                cont.removeChild(this.parentElement);
                graph.refresh();
            });
        }
        
        function appendChoiceElements(){
            choiceDiv.appendChild(cLabel);
            choiceDiv.appendChild(sChoice);
            choiceDiv.appendChild(sLabel);
            choiceDiv.appendChild(tNode);
            choiceDiv.appendChild(endSpan);
            choiceDiv.appendChild(endBox);
            choiceDiv.appendChild(removeBtn);
            cont.appendChild(choiceDiv);
        }
        function changeEdges(selected){
                 tNode.addEventListener('change', function (e){
                    var oldEdge, newEdge, lastEdgeInedx;
                    lastEdgeInedx = graph.graph.getLastEdgeInedx();
                    oldEdge = Edges(selected.name) || new Edge(-1);
                    newEdge = new Edge(lastEdgeInedx+1);
                    newEdge.id = 'e' + Number.parseInt(lastEdgeInedx+1);
                    newEdge.choice = oldEdge.choice || e.path[1].getElementsByTagName("input")[0].value;
                    newEdge.count = oldEdge.count || 0;
                    newEdge.end = oldEdge.end || false;
                    newEdge.type = oldEdge.type || "curvedArrow";
                    newEdge.source = e.path[3].id || '';
                    newEdge.target = selected.value || '';
                    selected.name = newEdge.id;
                    if(Edges(oldEdge.id)){graph.graph = graph.graph.dropEdge(oldEdge.id);}
                    graph.graph = graph.graph.addEdge(newEdge);
                    console.log(newEdge.id);
                    graph.refresh();
                });
        }
        function changeChoice(choice){
            choice.addEventListener('change',function (e){
                var E = Edges(e.path[1].getElementsByTagName("select")[0].name);
                if(E){ E.choice = e.srcElement.value;}
                graph.refresh();
            });
        }
    }
