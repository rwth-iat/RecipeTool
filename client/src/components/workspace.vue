<script setup>
    import { ref } from 'vue'
    
    let drag = false
    const workspace_items = ref([])

    
    const log = (event) =>{
      console.log(event);
    }

    //check if id is 
    const id_in_arr = (arr, id) => {arr.some(function(element) {
        return element.id == id;});
    }

    //function to edit item entry if it already exists and add if not
    function edit_Workspace_items(id, name, type, x, y) {
        //check if id already exists
        var item = workspace_items.value.find(b => b.id === id);
        if (item) {
            item.name = name;
            item.type = type;
            item.x = x;
            item.y = y;
        } else {
            workspace_items.value.push({ id, name, type, x, y });
        }
    }

    const onDrop = (event) => {
        console.log("Drop");
        event.preventDefault();
        // Get the id of drag source element (that was added to the drag data
        // payload by the dragstart event handler)
        var id = event.dataTransfer.getData("itemID");
        var name = event.dataTransfer.getData("itemName");
        var classes = event.dataTransfer.getData("itemClasses");

        var x = event.clientX + "px"
        var y = event.clientY + "px"

        // If element is taken from the side_bar and dropped into the workspace clone the element
        // that way it still is in the side bar to be used multiple times
        if(classes.includes("sidebar_element")){
            //add new clone to document
            //generate a new unique id for the copied element
            var unique_id = Date.now().toString(36) + Math.random().toString(36).substring(2);;
            workspace_items.value.push({id:unique_id, name:name, type:"process", x:x, y:y})
            console.log("dragged from sidebar, dropped in workspace at absolute position: " + event.clientX.toString() + " " + event.clientY.toString() );
            console.log(workspace_items)
        }

        // if its an workspace element move it
        else if (classes.includes("workspace_element")) {
            // find element and edit x and y position
            edit_Workspace_items(id, name, "process", x, y)
            console.log(workspace_items)
        //reset border of the element
        //element.style.border = "1px solid black";
        }
    }
    const dragstart = (event, id, name, classes) =>{
		console.log("dragstart")
		event.dataTransfer.dropEffect = "move"
		event.dataTransfer.effectAllowed = "move"
		event.dataTransfer.setData("itemID", id)
		event.dataTransfer.setData("itemName", name)
		event.dataTransfer.setData("itemClasses", classes)
        event.dataTransfer.setData("workspaceItems", workspace_items)
	}
</script>

<template>
    <div    id="workspace"
            @drop="$event => onDrop($event)"
            @dragenter.prevent
            @dragover.prevent
    >
		<div class="workspace_element" 
            v-for="element in workspace_items" 
            :style="{ left: element.x, top: element.y}"
            draggable="true"
            @dragstart="$event => dragstart($event, element.id, element.name, 'workspace_element')"
            >
			    {{element.name}}
		</div>
    </div>
</template>


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
