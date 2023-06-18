<script setup>
    import { ref } from 'vue'
    import draggable from 'vuedraggable'
    
    let drag = false
    const workspace_items = ref([{name:"testName", type:"process"},])
    //let workspace_items =[{name:"testName", type:"process"},]
    
    const log = (event) =>{
      console.log(event);
    }

    //check if id is 
    const id_in_arr = (arr, id) => {arr.some(function(element) {
        return element.id == id;});
    }

    function edit_Workspace_items(name, author, year, rating, id) {
        var book = workspace_items.find(b => b.id === id);
        if (book) {
            book.name = name;
            book.author = author,
            book.year = year;
            book.rating = rating;
        } else {
            workspace_items.push({ id, name, author, year, rating });
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


        // If element is taken from the side_bar and dropped into the workspace clone the element
        // that way it still is in the side bar to be used multiple times
        //!id_in_arr(workspace_items, id)
        if(classes.includes("sidebar_element")){
            //add new clone to document
            //ev.target.appendChild(nodeCopy);
            workspace_items.value.push({"name":name, "type":"process", "x":event.clientX + "px", "y":event.clientY + "px"})
            console.log("dragged from sidebar, dropped in workspace at absolute position: " + event.clientX.toString() + " " + event.clientY.toString() );
            console.log(workspace_items)
        }

        // if element is in workspace and gets moved to workspace just move it
        // also check if target is itself so it can be sligthly moved
        else if (classes.contains("workspace_element") && (ev.target.id == "workspace")) {
            workspace_items.value.push({"name":name, "type":"process", "x":event.clientX + "px", "y":event.clientY + "px"})
            // this is the actual "drag code"
            //element.style.left = ev.clientX +"px";
            //element.style.top = ev.clientY +"px";
            //console.log("dragged from workspace, dropped in workspace at absolute position: " + ev.clientX.toString() + " " + ev.clientY.toString() );

        //reset border of the element
        element.style.border = "1px solid black";
        }
    }
</script>

<template>
    <div    id="workspace"
            @drop="$event => onDrop($event)"
            @dragenter.prevent
            @dragover.prevent
    >
		<div class="workspace_element" v-for="element in workspace_items" :style="{ left: element.x, top: element.y}">
			{{element.name}}
		</div>
    </div>
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
