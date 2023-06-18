<script setup>
    import { ref } from 'vue'
    import draggable from 'vuedraggable'
    
    let drag = false
    
    const log = (event) =>{
      console.log(event);
    }

    //check if id is 
    const id_in_arr = (arr, id) => {arr.some(function(element) {
        return element.id == id;});
    }
</script>
<script>
export default {
    name: "Dashboard",
    components: {
        draggable
    },
    data(){
        return {
        enabled: true,
        workspace_items: [{name:"testName", type:"process"},],
        dragging: false,
        }
    },
    methods: {
        onDrop(event){
        console.log("Drop");
        event.preventDefault();
        // Get the id of drag source element (that was added to the drag data
        // payload by the dragstart event handler)
        var id = event.dataTransfer.getData("itemID");
        var name = event.dataTransfer.getData("itemName");
        var classes = event.dataTransfer.getData("itemClasses");


        // If element is taken from the side_bar and dropped into the workspace clone the element
        // that way it still is in the side bar to be used multiple times
        //!id_in_arr(workspace_items, id)
        if(classes.includes("sidebar_element")){
            const div = document.createElement("div");
            div.id = id ;
            div.className = classes;

            //document.body.appendChild(div);  
            //if (element.classList.contains("side_bar_element") && ev.target.id == "workspace") {

            //generate a new unique id for the copied element
            div.id = Date.now().toString(36) + Math.random().toString(36).substring(2);;
        
            // this is the actual "drag code"
            div.style.left = event.clientX + "px";
            div.style.top = event.clientY + "px";
            div.style.background = "white";

            //change classes to signify that the next time it is dragged it should be moved not copied
            //also style is changed, for example is position set to "absolute"
            div.classList.remove("side_bar_element");
            div.classList.add("workspace_element");

            //reset border of the element
            div.style.border = "1px solid black";
            
            //make it draggable 
            //(the following stackoverflow comment states that for cross browser interoperability you are better off using a js framework to make things dynamically draggable.)
            //but works for now
            //https://stackoverflow.com/questions/16296029/adding-ondragstart-handler-to-dynamically-created-images
            //div.addEventListener('dragstart', dragstart, false);
            div.draggable=true

            //add new clone to document
            //ev.target.appendChild(nodeCopy);
            workspace_items.push(name)
            console.log("dragged from sidebar, dropped in workspace at absolute position: " + event.clientX.toString() + " " + event.clientY.toString() );
        }

        // if element is in workspace and gets moved to workspace just move it
        // also check if target is itself so it can be sligthly moved
        else if (classes.contains("workspace_element") && (ev.target.id == "workspace")) {
            // this is the actual "drag code"
            //element.style.left = ev.clientX +"px";
            //element.style.top = ev.clientY +"px";
            //console.log("dragged from workspace, dropped in workspace at absolute position: " + ev.clientX.toString() + " " + ev.clientY.toString() );

        //reset border of the element
        element.style.border = "1px solid black";
        }
    }
    }
}
</script>

<template>
    <draggable  id="workspace"
                :list="workspace_items"
                group="element-drag-drop"
                item-key="id"
                @change="log"
                >
					<template #item="{element}">
						<div class="workspace_element"
						>
							{{element.name}}
						</div>
					</template>
    </draggable>
</template>
<!--@drop.prevent="$event => onDrop($event)"
                @dragover.prevent
                @dragenter.prevent
-->
<style>
    /*container for material*/
    #workspace{
        width: 100vw;
        height: 100vh - var(--topbar-height);
        flex: 1 1 0;
        /*float:left;*/
        border-radius: 5px;
        border-width:1px;
        border-style:solid;
        border-color:black;

        /*grid background*/
        background-size: 40px 40px;
        background-image: radial-gradient(circle, #000 1px, rgba(0, 0, 0, 0) 1px);
    }
    .workspace_element{
        position: absolute;
        width: 200px;
        height: auto;
        text-align: center;
        border-radius: 5px;
        border-width:1px;
        border-style:solid;
        border-color:black;
    }
</style>
