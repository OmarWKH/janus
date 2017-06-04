class container{
    constructor(parent){
        this.parent = parent;
    }
    appendChildern(cont = this.parent){
        for (let child in this){
            if (this[child] instanceof HTMLElement && this[child] !== cont && this[child] !== this.parent){
                cont.appendChild(this[child]);
            }
        }
    }
    emptyContainer(cont){
        while(cont.firstChild){
            cont.removeChild(cont.firstChild);
        }
    
    }
}
class InfoBox extends container{
    constructor(node, cont){
        super(cont);
        this.emptyContainer(cont);
        this.infoBox = document.createElement("div");
        this.infoBox.id = node.id;
        this.label = new Label(node, this.infoBox);
        this.choiceBox = new ChoiceBox(node, this.infoBox);        
        this.content = new Content(node, this.infoBox);
        this.appendChildern();
    }
}

class Label extends container{
    constructor(node, box){
        super(box);
        this.labelSpan = document.createElement("span");
        this.labelSpan.innerHTML = "Node Label";
        this.label = document.createElement("input");
        this.label.type = "text";
        this.label.value = node.label;
        this.label.addEventListener('change', function(e){
            node.label = e.target.value;
            ibox = new InfoBox(node, ibox.parent);
            graph.refresh();
        });
        this.appendChildern();
    }
}

class Content extends container{
    constructor(node, cont){
        super(cont);
        this.contentSpan = document.createElement("span");
        this.contentSpan.innerHTML = "Content of Node";
        this.contentArea = document.createElement("textarea");
        this.contentArea.style.width = "100%";
        this.contentArea.value = node.content;
        this.bindContentArea(node);
        this.appendChildern();
    }
    bindContentArea(node){
        this.contentArea.addEventListener('change', function(e){
            node.content = this.value;
            graph.refresh();
        });
    }
}
class ChoiceBox extends container{
    constructor(node, cont){
        super(cont);
        this.choiceBox = document.createElement("div");
        this.choiceBox.name = "targets";
        this.choiceBox.id = "nodeTaregets";
        this.choiceBox.style = "display:flex; flex-flow: column; ";
        this.choices = this.setChoices(node.id, this.choiceBox);
        this.addBtn = document.createElement("div");
        this.addBtn.innerHTML = "+";
        this.addBtn.style = "color: green;";
        this.bindAddBtn(node.id);
        this.appendChildern();
    }
    setChoices(id, cont){
		let choices = {};
        graph.graph.getEdgesByNodeId(id).forEach(function(edge){
            let choice = new ChoiceInfo(edge, cont);
			choices[choice.choiceDiv.id] = choice;
        });
		return choices;
    }
    bindAddBtn(nodeId){
        let cont = this.choiceBox;
        this.addBtn.addEventListener('click', function (e){
            let _edge = Edge.generateEmptyEdge(nodeId);
            graph.graph.addEdge(_edge);
            graph.refresh();
            new ChoiceInfo(_edge, cont);
        });
    }
}
class ChoiceInfo extends container{
    constructor(edge, cont){
        super(cont);
        this.choiceDiv = document.createElement("div");
        this.choiceDiv.style = "display: flex; flex-flow: row;";
        this.choiceDiv.id = edge.id;
        
        this.choiceSpan = document.createElement("span");
        this.choiceSpan.innerHTML = "Choice";
        this.choiceContent = document.createElement("input");
        this.choiceContent.type = "text";
        this.choiceContent.value = edge.choice;
        this.bindChoiceContent();
        
        this.targetSpan = document.createElement("span");
        this.targetSpan.innerHTML = "Choice lead to";
        this.nodeLi = document.createElement("select");
        this.nodeLi.class = "tNodes";
        this.updateOptions(this.nodeLi);
        this.bindNodeLi();

        this.endSpan = document.createElement("span");
        this.endSpan.innerHTML = "is this an Ending Choice";
        this.endBox = document.createElement("input");
        this.endBox.type = "checkbox";
        this.endBox.checked = ((!graph.graph.edges(edge.id)) ? true : false);
        this.bindEndBox();

        this.removeBtn = document.createElement("span");
        this.removeBtn.innerHTML = "X";
        this.removeBtn.style = "color: red; background-color: black;";
        this.bindRemoveBtn();
        
        this.appendChildern(this.choiceDiv);
        cont.appendChild(this.choiceDiv);
        }
    updateOptions(){
        let cont = this.nodeLi,
            selectedVal = cont.value;
        this.emptyContainer(cont);
        graph.graph.nodes().forEach(function(node){
            new Option(node.id, node.label, cont)
        });
        if(graph.graph.edges(this.choiceDiv.id)){
            let selectedVal = graph.graph.edges(this.choiceDiv.id).target;
            cont.value = selectedVal || cont.value;
        }
    }
    bindChoiceContent(){
        let edge = graph.graph.edges(this.choiceDiv.id) || story.getHedge(this.choiceDiv.id); 
        this.choiceContent.addEventListener('change', function(e){
            edge.choice = this.value;
        });
    }
    bindNodeLi(){
        let edgeId = this.choiceDiv.id,
            edge = graph.graph.edges(edgeId);
        this.nodeLi.addEventListener('change', function (e){
            edge.target = this.value;
            graph.refresh();
        });
    }
    bindEndBox(){
        let selEl = this.nodeLi,
            choiceDiv = this.choiceDiv;
        this.endBox.addEventListener('change', function (e){
            if(e.target.checked){
                console.log(ibox.infoBox.id);
                let edge = graph.graph.edges(choiceDiv.id),
                endEdge = HEdge.generateFromEdge(edge);
                story.endings.push(endEdge);
                console.log(graph.graph.edges(choiceDiv.id));
                try{
                    graph.graph.dropEdge(edge.id);
                } catch(e){
                    if(graph.graph.edges(edge.id)){
                        graph.graph.dropEdge(edge.id);
                    }
                }
                finally{
                    graph.refresh();
                    choiceDiv.id = endEdge.id;
                    selEl.value = ibox.infoBox.id;
                    selEl.disabled = true;
                }
            }else{
                console.log(ibox.infoBox.id);
                let edge = story.getHedge(choiceDiv.id),
                restoredEdge = Edge.generateFromHEdge(edge);
                graph.graph.addEdge(restoredEdge);
                story.removeHedge(edge.id);
                choiceDiv.id = restoredEdge.id;
                selEl.disabled = false;
                selEl.value = ibox.infoBox.id;
            }
            graph.refresh();
        });   
    }
    bindRemoveBtn(){
        let choiceDiv = this.choiceDiv,
            parent = this.parent;
        this.removeBtn.addEventListener("click", function(e){
            let eID = choiceDiv.id;
            try{
                if(graph.graph.edges(eID)){
                    graph.graph.dropEdge(eID);
                }
                else{
                    story.removeHedge(eID);
                }
            }catch(e){
                if(graph.graph.edges(eID)){
                    graph.graph.dropEdge(eID);
                    graph.refresh();
                }
            }
            finally{
                parent.removeChild(choiceDiv);
                graph.refresh();
            }
        });
    }
}
class Option extends container{
    constructor(id, label, cont){
        super(cont);
        this.opt = document.createElement("option");
        this.opt.text = label;
        this.opt.value = id;
        this.appendChildern();
    }
}