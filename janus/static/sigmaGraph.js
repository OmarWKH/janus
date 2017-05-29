
var graph, story,
    createGraph = function (jsonF, gcontainer, icontainer) {
        "use strict";
        story = new SigmaLayout(jsonF);
        
        sigma.classes.graph.addMethod('getLastEdgeInedx', function () {
            if (this.edgesArray.length > 0) {
                var lastEdgeID = this.edgesArray[this.edgesArray.length-1].id;
                return Number.parseInt(lastEdgeID.substr(1));
            }
            return 0;
        });
        sigma.classes.graph.addMethod('getLastNodeIndex', function (){
            if (this.nodesArray.length > 0) {
            var lastNodeID = this.nodesArray[this.nodesArray.length-1].id;
            return Number.parseInt(lastNodeID.substr(1));
                }
            return 0;
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
            var n = graph.graph.getLastNodeIndex()+1;
            
            graph.graph.addNode({
                id: 'n' + n,
                size: 10,
                x: (n+1) / n,
                y: 0,
                label: '',
                content: ''
            });
            updateOptions();
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
            nodeInfoForm.id = node.id;
            nodeLabel.value = node.label;
            setTargets(targets, node);
            nodeLabel.addEventListener('change', function(e){
                node.label = nodeLabel.value;
                graph.refresh();
            });
            contentArea.value = node.content;
            contentArea.addEventListener('change', function(e){
                node.content = contentArea.value;
                graph.refresh();
            });
        });
        graph.bind('doubleClickNode', function (e){
            graph.graph = graph.graph.dropNode(e.data.node.id);
            updateOptions();
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
            updateOptions();
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
            
            tChoices = [];
            let op = document.createElement("option");
            op.text = "...";
            op.value = '-1';
            tChoices.push(op);
            Nodes().forEach(function (n){
                let op = document.createElement("option");
                op.text = n.label;
                op.value = n.id;
            });
            tChoices.forEach(function (o, i){
                let op = o.cloneNode(true);
                tNode.appendChild(op, i);
            });
            
            sChoice = document.createElement("input");
            sChoice.type = "text";
            
            endBox = document.createElement("input");
            endBox.type = "checkbox";
            
            endSpan = document.createElement("span");
            endSpan.innerHTML = "is this an Ending Choice";
            
            endBox.addEventListener('change', function (e){
                var id = e.target.parentElement.getElementsByTagName("select").name;
                if(e.srcElement.checked){
                    story.endings.push(Edges(id));
                    graph.graph.dropEdge(id);
                }
                else{
                    graph.graph.addEdge(Edges(id));
                    story.removeHedge(id);
                }
                graph.refresh();
            })
            removeBtn = document.createElement("span");
            removeBtn.innerHTML = "X";
            removeBtn.style = "color: red; background-color: black;";
            removeBtn.addEventListener("click", function(e){
                var eID = e.target.parentElement.getElementsByTagName("select")[0].name;
                if(eID){
                    graph.graph.dropEdge(eID);
                    }
                cont.removeChild(this.parentElement);
                updateOptions();
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
                    if (selected.value !== -1){
                    var oldEdge, newEdge, lastEdgeInedx, form = document.getElementsByTagName("form")[0], pDiv = e.target.parentElement ;
                    lastEdgeInedx = graph.graph.getLastEdgeInedx();
                    oldEdge = Edges(selected.name) || new Edge(0);
                    newEdge = new Edge(lastEdgeInedx+1);
                    newEdge.id = 'e' + Number.parseInt(lastEdgeInedx+1);
                    newEdge.choice = oldEdge.choice || pDiv.getElementsByTagName("input")[0].value;
                    newEdge.end = oldEdge.end;
                    newEdge.type = oldEdge.type || "curvedArrow";
                    newEdge.source = form.id || '';
                    newEdge.target = selected.value || '';
                    selected.name = newEdge.id;
                    if(Edges(oldEdge.id)){
                        graph.graph = graph.graph.dropEdge(oldEdge.id);
                    }
                        graph.graph = graph.graph.addEdge(newEdge);
                    graph.refresh();
                    }
                });
        }
        function changeChoice(choice){
            choice.addEventListener('change',function (e){
                let E = Edges(e.target.parentElement.getElementsByTagName("select")[0].name);
                if(E){ E.choice = e.srcElement.value;}
                graph.refresh();
            });
        }

}
        function updateOptions(){
            var selects = document.getElementsByTagName("select"), choices = [];
            graph.graph.nodes().forEach(function (n){
                let op = document.createElement("option");
                op.text = n.label;
                op.value = n.id;
                choices.push(op);
            });
            for (let i = 0; i < selects.length; i++){
                let selectedIndec = selects[i].selectedIndex;
                while(selects[i].firstChild){
                    selects[i].removeChild(selects[i].firstChild);
                }
                for (let j = 0; j < choices.length; j++){
                    let opt = choices[j].cloneNode(true);
                    selects[i].appendChild(opt, j);
                }
                selects[i].selectedIndex = selectedIndec;
            }
    }