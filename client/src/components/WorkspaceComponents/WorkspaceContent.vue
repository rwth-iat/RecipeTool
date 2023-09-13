<template>
  <div class="workspace_content" ref="workspaceContentRef" @drop="$event => onDrop($event)" @dragenter.prevent @dragover.prevent draggable="false" @mousedown="startPanning" @mousemove="handlePanning" @mouseup="stopPanning">
      <!--Draw all workspace elements. Connections are drawn by jsplumb in the background-->
        <div :class="'workspace_element ' + item.type" 
            v-for="item in computedWorkspaceItems" 
            :key="item.id" 
            :ref="skipUnwrap.jsplumbElements" 
            :id="item.id"
            @click="handleClick(item)"
        >
            {{ item.name }}
        </div>
    </div>
</template>

<script setup>
    import { onMounted, ref, defineProps, defineEmits, computed } from 'vue';
    const props = defineProps(['workspace_items']);
    const emit = defineEmits(['content-ref', 'jsplumbElements', 'openPropertyWindow']);  
    const workspaceContentRef = ref(null)
    const jsplumbElements = ref([])

    //need this as the developer server "npm run dev" will run into error using a normal ref of a v-for. This skips the unwrapping
    var skipUnwrap = {jsplumbElements}

    //here we make the ref to the workspace_content availible in the parent
    onMounted(() => {
        workspaceContentRef.value.focus();
        emit('content-ref', workspaceContentRef);
        emit('jsplumbElements', jsplumbElements);
    });

    const computedWorkspaceItems = computed(() => {
        return props.workspace_items || [];
    });

    /*
        The follwing Functions handle the opening and closing of the property window.
        Every click checks if in the last 300 miliseconds the same target was already clicked.
        Then it is registered as a double click and the property window is opened.
    */
    //double click opens window
    const lastClickTime = ref(0);
    const doubleClickThreshold = 300; // Adjust this value as needed (in milliseconds)
    const handleClick = (item) => {
        const currentTime = new Date().getTime();
        console.log("click_detected")
        if (currentTime - lastClickTime.value < doubleClickThreshold) {
        handleDoubleClick(item);
        } else {
        lastClickTime.value = currentTime;
        }
    };
    const handleDoubleClick = (item) => {
        // Logic to handle double click
        emit('changeSelectedElement', item)
        emit('openPropertyWindow')
        console.log('Double click detected!');
    };


    /*
        the following parameters and functions handle the panning of the workspace
        to pan the workspace you drag the background 
    */
    //dragging parameters
    let panning = false; // Flag to indicate if panning is currently active
    let initialMouseX = 0; // Initial mouse X position when starting to pan
    let initialMouseY = 0; // Initial mouse Y position when starting to pan
    let initialPanX = 0; // Initial pan X value when starting to pan
    let initialPanY = 0; // Initial pan Y value when starting to pan
    /*
    This Function is called when the workspace_content is dragged.
    When dragging elements the event is also propagated to the parent("workspace_conntent") therefore we check if the target was the workspace_content.
    */ 
    const startPanning = (event) => {
        if (event.target.classList.contains("workspace_content")) {
        panning = true;
        initialMouseX = event.clientX;
        initialMouseY = event.clientY;
        initialPanX = workspaceContentRef.value.offsetLeft;
        initialPanY = workspaceContentRef.value.offsetTop;
        document.addEventListener("mousemove", handlePanning);
        document.addEventListener("mouseup", stopPanning);
        }
    }
    const handlePanning = (event) => {
        if (panning) {
        // Handle panning only if not dragging an element
        const deltaX = event.clientX - initialMouseX;
        const deltaY = event.clientY - initialMouseY;

        // Update the position of workspace_content
        workspaceContentRef.value.style.left = initialPanX + deltaX + "px";
        workspaceContentRef.value.style.top = initialPanY + deltaY + "px";
        }
    };

    const stopPanning = () => {
        panning = false;
        document.removeEventListener("mousemove", handlePanning);
        document.removeEventListener("mouseup", stopPanning);
    };

    // TODO: check if this interfers with js plumb drag and drop as it may be called on every drop event
    function onDrop(event){
        console.log("Drop");
        event.preventDefault();
        //var id = event.dataTransfer.getData("itemID");
        var name = event.dataTransfer.getData("itemName");
        var classes = event.dataTransfer.getData("itemClasses");
        
        var type 
        console.log(classes)
        if (classes.includes("material_element")){
            type = "material"
        }else if (classes.includes("process_element")){
            type = "process"
        }else{
            console.log("neither material nor process")
        }

        //get mouse postion and substrac workspace position to get relative position as workspace elemenets are positioned relative (is needed for jsplumb)
        var rect = event.target.getBoundingClientRect();
        var x = event.clientX - rect.left; //+ "px"  x position within the element.
        var y = event.clientY - rect.top;

        // if it is a sidebar element add new item to workspace list. Drag and drop of workspace elements is handled by jsplumb
        if (classes.includes("sidebar_element")) {
            var unique_id = Date.now().toString(36) + Math.random().toString(36).substring(2);
            //var unique_id = id;
            computedWorkspaceItems.value.push({ id: unique_id, name: name, type: type, x: x, y: y });
            console.log("dragged from sidebar, dropped in workspace at absolute position: " + event.clientX.toString() + " " + event.clientY.toString());
            console.log(props.workspace_items);
        }
    }
</script>

<style>
    .workspace_content {
        position: relative;
        width: calc(100% + 200px); /* Adjust the value based on your needs */
        height: calc(100% + 200px); /* Adjust the value based on your needs */
        transform-origin: center center;
        background-size: 50px 50px;
        background-image: radial-gradient(circle, #000 1px, rgba(0, 0, 0, 0) 1px);
        z-index: 1;
    }
    .workspace_element {
        display: flex;
        position: absolute;
        text-align: center;
        justify-content: center;
        align-items: center;
    }
    .material{
        background-color:#fff;
        border:1px solid black;    
        height:100px;
        border-radius:50%;
        -moz-border-radius:50%;
        -webkit-border-radius:50%;
        width:100px;
    }
    .process{
        background-color:#fff;
        width: 200px;
        height: 30px;
        border-radius: 5px;
        border-width: 1px;
        border-style: solid;
        border-color: black;
    }
</style>