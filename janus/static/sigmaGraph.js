
var graph, story,
    init = function (storyID, jsonF, gC, iC){
        gC = document.getElementById(gC);
        iC = document.getElementById(iC);
        createGraph(jsonF, gC, iC);
    },
    createGraph = function (jsonF, gcontainer, icontainer) {
        "use strict";
        story = new SigmaLayout(jsonF);
        document.addEventListener('unload', function(e){
            let url = window.location.protocol + "//" + window.location.host + "/save_checkpoints"
            story = graph.graph;
            let json = new Story(story);
            let params = JSON.stringify(json);
            httpPostAsync(url, params);
        });
        sigma.classes.graph.addMethod('getLastEdgeInedx', function(){
            if (this.edgesArray.length>0){
            var lastEdgeID = this.edgesArray[this.edgesArray.length-1].id;
            return Number.parseInt(lastEdgeID.substr(1));
            }
            return 0;
        });
        sigma.classes.graph.addMethod('getLastNodeIndex', function (){
            if (this.nodesArray.length > 0){
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
            graph.refresh();
        });
    },
    
    createInfoBox = function (icontainer){
        
        var nodeInfoForm, nLabel, nodeLabel, targets, ctaLabel, contentArea, saveBtn;
        nodeInfoForm = document.createElement("form");
        nLabel = document.createElement("span");
        nodeLabel = document.createElement("input");
        targets = document.createElement("div");
        ctaLabel = document.createElement("span");
        contentArea = document.createElement("textarea");
        saveBtn = document.createElement("button");
        
        saveBtn.value = "Save";
        saveBtn.addEventListener('click', function (e){
            let url = window.location.protocol + "//" + window.location.host + "/save_checkpoints"
            story = graph.graph;
            let json = new Story(story);
            let params = JSON.stringify(json);
            httpPostAsync(url, params);
        });
        
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
                updateOptions();
                graph.refresh();
            });
            story = graph.graph;
            
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
//        story.endings.forEach(function (edge){
//                console.log("f");
//                createChoiceElements();
//                tNode.value = Nodes(edge.target).id || '';
//                tNode.name = edge.id || '';
//                changeEdges(tNode);
//                
//                sChoice.value = edge.choice || '';
//                sChoice.name = edge.id || '';
//                changeChoice(sChoice);
//                appendChoiceElements();
//        });
        updateOptions();
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
            updateOptions();
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
            
            tChoices.forEach(function (o){
                var op = o.cloneNode(true);
                tNode.add(op);
            });
            
            sChoice = document.createElement("input");
            sChoice.type = "text";
            
            endBox = document.createElement("input");
            endBox.type = "checkbox";
            
            endSpan = document.createElement("span");
            endSpan.innerHTML = "is this an Ending Choice";
            
            endBox.addEventListener('change', function (e){
                var id = e.path[1].getElementsByTagName("select")[0].name;
                if(e.srcElement.checked){
                    story.endings.push(Edges(id));
                    graph.graph.dropEdge(id);
                }
                else{
                    console.log(story.getHedge(id));
//                    graph.graph.addEdge();
//                    story.removeHedge(id);
                }
                graph.refresh();
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
                    updateOptions();
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
        function updateOptions(){
            var Choices = [];
            var opB = document.createElement("option");
            opB.text = '...';
            Choices.push(opB);
            graph.graph.nodes().forEach(function (n, i){
            var op = document.createElement("option");
            op.text = n.label;
            op.value = n.id;
            Choices.push(op);
        });
            var selects = document.getElementsByTagName("select");
            for (var i = 0; i< selects.length ; i++){
                while(selects[i].firstChild){
                    selects[i].removeChild(selects[i].firstChild);
                }
            }
            if(selects.length>0){
            for (var i = 0; i < selects.length; i++){
                Choices.forEach(function (o, x){
                    var op = o.cloneNode(true);
                    selects[i].appendChild(op, x);
                });
            }
        }
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
}

function nullFallback(status, responseText) {
    console.log("response status: " + status);
    console.log("response text: " + responseText);
}
