<!--Draw all workspace elements. Connections are drawn by jsplumb in the background-->
<template>
  <div id="workspace" @dragenter.prevent @dragover.prevent>
    <!-- Workspace elements -->
    <div class="workspace_content" ref="workspace_content" @drop="$event => onDrop($event)" @dragenter.prevent @dragover.prevent draggable="false" @mousedown="startPanning" @mousemove="handleMouseMove" @mouseup="stopPanning">
      <!-- Your flowchart elements here -->
      <div :class="'workspace_element ' + item.type" 
      v-for="item in workspace_items" 
      :key="item.id" 
      :ref="skipUnwrap.jsplumbElements" 
      :id="item.id"
      @click="handleClick(item)"
    >
      {{ item.name }}
    </div>
    </div>

    <!-- Zoom Buttons-->
    <div class="buttons-container">
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>
    </div>

    <!-- Property window -->
    <div class="property-window-container">
    <transition name="property-window">
      <div v-show="isPropertyWindowOpen" >
        <PropertyWindowContent
        :selectedElement="selectedElement" 
        @close="closePropertyWindow" />
      </div>
    </transition>
    </div>
  </div>
</template>


<script setup>
  import { ref, onMounted, onUpdated, watch, nextTick } from 'vue';
  import axios from 'axios'
  import { newInstance, ready } from "@jsplumb/browser-ui";
  import { generate_batchml } from './create_xml/new_export_xml.js';
  import PropertyWindowContent from './WorkspaceComponents/PropertyWindow.vue'; // Import your property window content component

  // when an element is dropped into the workspace workspace_items 
  const workspace_items = ref([]);

  let instance = null; //the jsplumb instance, this is a library which handles the drag and drop as well as the connections 
  const workspace_content = ref(null); // workspace references the workspace DOM-Element which js plumb needs as parent object

  //need this as the developer server "npm run dev" will run into error using a normal ref of a v-for. This skips the unwrapping
  const jsplumbElements = ref([]);
  var skipUnwrap = { jsplumbElements }
  //object to mark to which elements Endpoints where already added. That why when detecting a change in workspace elemets we know which items are new 
  const managedElements = ref({})

  var selectedElement = ref({});

  
  //dragging parameters
  let panning = false; // Flag to indicate if panning is currently active
  let draggingElement = false; // Track dragging of individual elements
  let initialMouseX = 0; // Initial mouse X position when starting to pan
  let initialMouseY = 0; // Initial mouse Y position when starting to pan
  let initialPanX = 0; // Initial pan X value when starting to pan
  let initialPanY = 0; // Initial pan Y value when starting to pan

  const client = axios.create({
    	//baseURL: process.env.VUE_APP_BASE_URL
		baseURL: ''
	});


  onMounted(() => {
    workspace_content.value.focus();
    console.log(jsplumbElements.value)
    instance = newInstance({
      container: workspace_content.value,
      maxConnections: -1,
      connectionOverlays: [{ type:"Arrow", options:{location:1}}], //sets the default connection to an arrow from source to target
      connector: "Flowchart"
    });
    workspace_content.value.style.transform = `scale(1)`;
    instance.setZoom(1);
  });

  function addSourceEndpoint(element){
    const sourceEndpoint = instance.addEndpoint(element, {
        source: true,
        anchor: "Bottom",
        endpoint: { type: "Dot" }
      });
      return sourceEndpoint
  }

  function addTargetEndpoint(element){
    const targetEndpoint = instance.addEndpoint(element, {
        target: true,
        anchor: "Top",
        endpoint: { type: "Dot" }
      });
    return targetEndpoint
  }

  // add endpoints and attach the element id as data to the endpoint. 
  // When exporting to xml we can iterate through the connections and when accessing the source Endpoint and Target endpoint we can now read the corresponding element
  async function addJsPlumbEndpoints(element, item) {
    console.log("entered addJSEndpoints")
    console.log(element)
    console.log(item)
    //await nextTick(); // we need this for smooth rendering
    // add source and target endpoint. That way the element is automatically added to jsplumb
    // if elements are managed by js plumb that also does the drag/drop functionality 
    if (element) {
      var sourceEndpoint = {}
      var targetEndpoint = {}
      if(item.type === "material"){
        if(item.name === "Eingangsmaterial"){
          sourceEndpoint = addSourceEndpoint(element)
          targetEndpoint = {id: ''}
        }else if(item.name === "Zwischenprodukt"){
          sourceEndpoint = addSourceEndpoint(element)
          targetEndpoint = addTargetEndpoint(element)
        }else if(item.name === "Endprodukt"){
          sourceEndpoint = {id: ''}
          targetEndpoint = addTargetEndpoint(element)
        }else{
          console.error("unknown material type: " + item.name)
        }
      }else if(item.type === "process"){
        sourceEndpoint = addSourceEndpoint(element)
        targetEndpoint = addTargetEndpoint(element)
      }else{
          console.error("unknown type: " + item.type)
      }

      // Save the endpoint IDs to the workspace_items list That way exporting the xml is easier as all connections can be easily read
      if (item) {
        item.sourceEndpointId = sourceEndpoint.id;
        item.targetEndpointId = targetEndpoint.id;
      }
    }
  }


  //if a new item is added automatically add endpoints to new items
  async function updateItemList(newItems) {
    console.debug("workspace_items updated, watcher triggered")
    await nextTick(); //wait for next tick to ensure that the newly added items of the workspace item list are actually rendered
    newItems.forEach(item => { //iterate through items
      const elementRef = jsplumbElements.value.find(element => {return element.id === item.id}); //find the corresponding DOM element
      if (!managedElements.value[item.id]) {    //check if there are any new items and run the following:
        addJsPlumbEndpoints(elementRef, item)  // add endpoints
        elementRef.style.left = item.x+"px";   //set x to x saved in Ondrop event
        elementRef.style.top = item.y+"px";    //set y to y saved in Ondrop event
        managedElements.value[item.id] = true  //mark as already managed to run this only once
      }
    });
  }
  watch(workspace_items, updateItemList, { deep: true });

  // TODO: check if this interfers with js plumb drag and drop as it may be called on every drop event
  const onDrop = (event) => {
    console.log("Drop");
    event.preventDefault();
    var id = event.dataTransfer.getData("itemID");
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
      workspace_items.value.push({ id: unique_id, name: name, type: type, x: x, y: y });
      console.log("dragged from sidebar, dropped in workspace at absolute position: " + event.clientX.toString() + " " + event.clientY.toString());
      console.log(workspace_items);
    }
  };
  function start_download(filename, file_string){
    //automatically start download
    var pom = document.createElement('a');
    var bb = new Blob([file_string], {type: 'text/plain'});
    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);
    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true; 
    pom.classList.add('dragout');
    pom.click();
  }

  function export_batchml(){
    var items = workspace_items.value
    var jsplumb_connections = instance.getConnections()
    var xml_string = generate_batchml(items, jsplumb_connections)
    client.get('/validate', {
            params: {
              "xml_string": xml_string
            }
      }).then(response => {
          if (response.status == 200){
            // handle success
            console.log("BatchML is valid!")
            start_download("Verfahrensrezept.xml", xml_string)
          }
      }).catch(error => {
          if (error.request.status == 400){
            // handle success
            console.log("BatchML is not valid!")
            start_download("invalid_Verfahrensrezept.xml", xml_string)
            window.alert("CAUTION: The generated Batchml is invalid, but is nevertheless downloaded.")
          }else if(error.request.status == 404){
            console.log("Unable to reach the server, are you maybe only running the client code?")
            console.log(error)
            window.alert("Error 404: Unable to reach the server, when validating the Batchml. Are you maybe only running the client code? For complete error message look into the browser devtools console")
          }else{
            // handle error
            console.log("error trying to validate the BatchML file:")
            console.log(error)
            window.alert("Error: The Batchml could not be validated. For complete error message look into the browser devtools console.")
          }
      })
  }
  defineExpose({
    export_batchml
  });

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
    selectedElement.value = item
    openPropertyWindow()
    console.log('Double click detected!');
  };

  //handle opening and closing the property window
  const isPropertyWindowOpen = ref(false);
  const openPropertyWindow = () => {
    isPropertyWindowOpen.value = true;
  };
  const closePropertyWindow = () => {
    isPropertyWindowOpen.value = false;
  };

  const zoomLevel = ref(1);

  // Zoom in by incrementing the zoom level
  const zoomIn = () => {
    zoomLevel.value += 0.1;
    workspace_content.value.style.transform = `scale(${zoomLevel.value})`;
    instance.setZoom(zoomLevel.value);
    console.log("zoom in");
  };

  // Zoom out by decrementing the zoom level
  const zoomOut = () => {
    zoomLevel.value -= 0.1;
    workspace_content.value.style.transform = `scale(${zoomLevel.value})`;
    instance.setZoom(zoomLevel.value);
    console.log("zoom out");
  };
  
  /*
  This Function is called when the workspace_content is dragged.
  When dragging elements the event is also propagated to the parent("workspace_conntent") therefore we check if the target was the workspace_content.
  */ 
  const startPanning = (event) => {
    if (!event.target.classList.contains("workspace_content")) {
      // If the clicked element is not the workspace, it's a drag action
      draggingElement = true;
    } else {
      panning = true;
      initialMouseX = event.clientX;
      initialMouseY = event.clientY;
      initialPanX = workspace_content.value.offsetLeft;
      initialPanY = workspace_content.value.offsetTop;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopPanning);
  };
}

const handleMouseMove = (event) => {
  if (panning && !draggingElement) {
    // Handle panning only if not dragging an element
    const deltaX = event.clientX - initialMouseX;
    const deltaY = event.clientY - initialMouseY;

    // Update the position of workspace_content
    workspace_content.value.style.left = initialPanX + deltaX + "px";
    workspace_content.value.style.top = initialPanY + deltaY + "px";
  }
};

const stopPanning = () => {
  panning = false;
  draggingElement = false; // Reset dragging status
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
};

</script>




<style>
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
    width: 200px;
    height: 30px;
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
  }

  #workspace {
    position: relative;
    height: calc(100vh - var(--topbar-height));
    flex: 1 1 0;
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    z-index: 0;
  } 
  .property-window-container {
    position: absolute;
    top: 0px; /* Adjust the top distance as needed */
    right: 0px; /* Adjust the right distance as needed */
    z-index: 2; /* Ensure property window appears above the workspace content */
  }


  .workspace_content {
  position: relative;
  width: calc(100% + 200px); /* Adjust the value based on your needs */
  height: calc(100% + 200px); /* Adjust the value based on your needs */
  transform-origin: center center;
  background-size: 50px 50px;
  background-image: radial-gradient(circle, #000 1px, rgba(0, 0, 0, 0) 1px);
  z-index: 1;
}

  /* Position buttons and property window */
  .buttons-container {
    position: absolute;
    top: 10px; /* Adjust the top distance as needed */
    left: 10px; /* Adjust the left distance as needed */
    z-index: 2; /* Ensure buttons appear above the workspace content */
  }

  .workspace_element {
    display: flex;
    position: absolute;
    text-align: center;
    justify-content: center;
    align-items: center;
  }

  .property-window-enter-active, .property-window-leave-active {
    transition: transform 0.5s ease-in-out; /* Adjust the duration as needed */
  }

  .property-window-enter-from, .property-window-leave-to {
    transform: translateX(100%);
  }
</style>
