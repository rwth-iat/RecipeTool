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
    import { onMounted, ref, computed, watch, nextTick } from 'vue';
    import { newInstance, ready } from "@jsplumb/browser-ui";
    const props = defineProps(['workspace_items']);
    const emit = defineEmits(['changeSelectedElement', 'openPropertyWindow', 'update:workspace_items']);  
    const workspaceContentRef = ref(null)
    const jsplumbInstance = ref(null) //the jsplumb instance, this is a library which handles the drag and drop as well as the connections
    const jsplumbElements = ref([])
    const managedElements = ref({}) //object to mark to which elements Endpoints where already added. That why when detecting a change in workspace elemets we know which items are new 
    const zoomLevel       = ref(1)

    //need this as the developer server "npm run dev" will run into error using a normal ref of a v-for. This skips the unwrapping
    let skipUnwrap = {jsplumbElements}

    //here we make the ref to the workspace_content availible in the parent
    onMounted(() => {
        workspaceContentRef.value.focus();
        if (workspaceContentRef.value) {
            ready(() => {
                jsplumbInstance.value = initializeJsPlumb(workspaceContentRef);
                watch(computedWorkspaceItems, createUpdateItemListHandler(jsplumbInstance, jsplumbElements, managedElements), {deep: true,});
            })
        }
    });
    
    // Create a computed property that represents the entire selectedElement
    // this is recommended solution to achieve two way binding between the parent and this child component
    // this way the parent component is the only one setting values.
    // it define a get and set method:
    //    -get: take the given object from the parent
    //    -set: emit to parent new object. The parent then sets the new value
    const computedWorkspaceItems = computed({
        get: () => props.workspace_items,
        set: (newValue) => {
            emit('update:workspace_items', newValue);
        },
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
        //var name = event.dataTransfer.getData("itemName");
        let item = JSON.parse(event.dataTransfer.getData("item"));
        let classes = event.dataTransfer.getData("itemClasses");
        
        let type 
        console.log(classes)
        if (classes.includes("material_element")){
            type = "material"
        }else if (classes.includes("process_element")){
            type = "process"
        }else{
            console.log("neither material nor process")
        }

        //get mouse postion and substrac workspace position to get relative position as workspace elemenets are positioned relative (is needed for jsplumb)
        let rect = event.target.getBoundingClientRect();
        let x = event.clientX - rect.left; //+ "px"  x position within the element.
        let y = event.clientY - rect.top;

        // if it is a sidebar element add new item to workspace list. Drag and drop of workspace elements is handled by jsplumb
        if (classes.includes("sidebar_element")) {
            let uniqueId = createUniqueId()
            //var unique_id = id;
            item.x=x
            item.y=y
            item.type=type
            item.description = item.name
            item.id=uniqueId
            computedWorkspaceItems.value.push(item);
            console.log("dragged from sidebar, dropped in workspace at absolute position: " + x + " " + y);
            console.log(props.workspace_items);
        }
    }

      // Function to initialize jsPlumb
  function initializeJsPlumb(container) {
    let instance = newInstance({
      container: container.value,
      maxConnections: -1,
      connectionOverlays: [{ type: "Arrow", options: { location: 1 } }],
      connector: "Flowchart"
    });
    container.value.style.transform = `scale(1)`;
    instance.setZoom(1);
    return instance
  }

  async function resetJsPlumb(){
    jsplumbInstance.value.reset()
    console.debug("resetted jsplumb:", jsplumbInstance.value)
  }

  function addEndpoint(instance, element, options){
    let anchor
    if(options.source){ anchor = "Bottom"}
    else if(options.target){anchor = "Top"}

    const sourceEndpoint = instance.addEndpoint(element, {
        source: options.source,
        target: options.target,
        anchor: anchor,
        endpoint: { type: "Dot" }
      });
      return sourceEndpoint
  }

  // add endpoints and attach the element id as data to the endpoint. 
  // When exporting to xml we can iterate through the connections and when accessing the source Endpoint and Target endpoint we can now read the corresponding element
  async function addJsPlumbEndpoints(instance, element, item) {
    console.log("Adding JS Endpoints to new Element", element)
    //await nextTick(); // we need this for smooth rendering
    // add source and target endpoint. That way the element is automatically added to jsplumb
    // if elements are managed by js plumb that also does the drag/drop functionality 
    if (element) {
      let sourceEndpoint = {}
      let targetEndpoint = {}
      if(item.type === "material"){
        if(item.name === "Eingangsmaterial"){
          sourceEndpoint = addEndpoint(instance, element, {source: true, target: false})
          targetEndpoint = {id: ''}
          console.log("added SourceEndpoint to Eingangsmaterial")
        }else if(item.name === "Zwischenprodukt"){
          sourceEndpoint = addEndpoint(instance, element, {source: true, target: false})
          targetEndpoint = addEndpoint(instance, element, {source: false, target: true})
          console.debug("added Source- and Target-Endpoint to Zwischenprodukt")
        }else if(item.name === "Endprodukt"){
          sourceEndpoint = {id: ''}
          targetEndpoint = addEndpoint(instance, element, {source: false, target: true})
          console.log("added TargetEndpoint to Endprodukt")
        }else{
          console.error("unknown material type: " + item.name)
        }
      }else if(item.type === "process"){
        sourceEndpoint = addEndpoint(instance, element, {source: true, target: false})
        targetEndpoint = addEndpoint(instance, element, {source: false, target: true})
        console.log("added Source and Target Endpoint to process")
      }else{
          console.warn("unknown type: " + item.type)
      }
      // Save the endpoint IDs to the workspace_items list That way exporting the xml is easier as all connections can be easily read
      if (item) {
        item.sourceEndpoint = sourceEndpoint;
        item.targetEndpoint = targetEndpoint;
      }
    }
  }

    function createUpdateItemListHandler(instance, jsplumbElements, managedElements) {
        return async (newItems) => {
            console.debug("workspace_items updated, watcher triggered");
            await nextTick(); //wait one tick otherwise the new workspace item is not yet in jsplumbElements
            await nextTick();
            
            // only handle elements that were added to the list (pushed), not removed ones (popped)
            const pushedItems = computedWorkspaceItems.value.filter((item) => newItems.includes(item));
            pushedItems.forEach((pushedItem) => {
                console.debug("New pushed element found:", pushedItem);
                // Handle the pop operation here
                const elementRef = jsplumbElements.value.find(
                    (element) => element.id === pushedItem.id
                );
                if(!elementRef){
                    console.debug("pushed element not found in jsplumbelements:", pushedItem)
                    return; // onoly returns the pushedItems.forEach function, effectively working as a continue
                }

                if (managedElements.value[pushedItem.id]===true) {
                    console.debug("pushed element already managed: ", pushedItem);
                    return;
                }

                console.debug("changed element not managed yet, placing in workspace and adding endpoints:", pushedItem);
                addJsPlumbEndpoints(instance.value, elementRef, pushedItem);
                elementRef.style.left = pushedItem.x + "px";
                elementRef.style.top = pushedItem.y + "px";
                managedElements.value[pushedItem.id] = true;
            });
        };
    }

    let zoomincrement = 0.1
    function zoom(newZoomLevel){
        console.log("zoom from zoom level: ", zoomLevel, " to: ", newZoomLevel)
        zoomLevel.value = newZoomLevel;
        workspaceContentRef.value.style.transform = `scale(${zoomLevel.value})`;
        jsplumbInstance.value.setZoom(zoomLevel.value);
    }
    // Zoom in by incrementing the zoom level
    function zoomIn(){
        zoom(zoomLevel.value+zoomincrement)
    }
    // Zoom out by decrementing the zoom level
    function zoomOut(){
        zoom(zoomLevel.value-zoomincrement)
    }

    async function clearWorkspace(){
        jsplumbInstance.value.deleteEveryConnection();
        for(let item of computedWorkspaceItems.value){
            const elementRef = jsplumbElements.value.find(
                (element) => element.id === item.id
            );
            if(elementRef!==undefined){
                jsplumbInstance.value.removeAllEndpoints(elementRef);
            }
        }
        //jsplumbElements.value=[]
        managedElements.value = {};
        while(computedWorkspaceItems.value.length>0){ //simply setting to [] did not work
            console.debug("pop item out of computedWorkspaceItems")
            computedWorkspaceItems.value.pop();
        }
        await resetJsPlumb()
        console.log("deleted all Elements from secondary workspace")
    }

    async function addElements(list){
        console.debug("add list:", list, " to Workspace:", computedWorkspaceItems)
        for(let element of list){
            if(!(computedWorkspaceItems.value.some(({ id }) => id === element.id))){ // check if element already exists
                console.log("add element to second workspace programatically: ",element);
                computedWorkspaceItems.value.push(element);
            }
        }
        await jsplumbInstance.value.repaintEverything();
        await nextTick()
    }

    function deleteElement(item){
        const elementRef = jsplumbElements.value.find(
            (element) => element.id === item.id
        );
        if(elementRef!==undefined){
            jsplumbInstance.value.removeAllEndpoints(elementRef);
            jsplumbInstance.value.deleteConnectionsForElement(elementRef)
            elementRef.remove();
        }
        //search for item in also delete from workspaceitemslist
        let index = computedWorkspaceItems.value.findIndex(element => element.id === item.id);
        if(index !== -1){
            computedWorkspaceItems.value.splice(index, 1);
        }
    }

    function getConnections(){
        return jsplumbInstance.value.getConnections()
    }
    function addConnections(connections){
        for (let connectionId in connections) {
            let connection = connections[connectionId];
            let sourceId = connection.sourceId;
            let targetId = connection.targetId;
            const sourceElementRef = computedWorkspaceItems.value.find(
                    (element) => element.id === sourceId
                );
            const targetElementRef = computedWorkspaceItems.value.find(
                    (element) => element.id === targetId
                );
            if(!sourceElementRef || !targetElementRef){
                console.warn("either sourceElement: ", sourceElementRef, " or targetElement:", targetElementRef, " is undefined")
                return
            }
            if(!sourceElementRef.sourceEndpoint || !targetElementRef.targetEndpoint){
                console.warn("either sourceEndpoint: ", sourceElementRef.sourceEndpoint, " or targetEndpoint:", targetElementRef.targetEndpoint, " is undefined")
                return
            }
            nextTick()
            jsplumbInstance.value.connect({ source:sourceElementRef.sourceEndpoint, target:targetElementRef.targetEndpoint})
        }
    }
    function createUniqueId(){
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    //expose this funciton so that i can be called from the Topbar export button
    defineExpose({
        zoomIn,
        zoomOut,
        clearWorkspace,
        addElements,
        addConnections,
        deleteElement,
        getConnections,
        createUniqueId
    });
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