<!--Draw all workspace elements. Connections are drawn by jsplumb in the background-->
<template>
  <div id="workspace" @dragenter.prevent @dragover.prevent>
    <!-- Workspace elements -->
    <WorkspaceContent :workspace_items="workspace_items"
      @changeSelectedElement="selectedElement = $event" 
      @content-ref="workspaceContentRef = $event" 
      @jsplumbElements="jsplumbElements = $event" 
      @openPropertyWindow="openPropertyWindow"
    />

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
  import { ref, onMounted, onUpdated, watch, nextTick, VueElement } from 'vue';
  import axios from 'axios'
  import { newInstance, ready } from "@jsplumb/browser-ui";
  import { create_validate_download_batchml } from './create_xml/new_export_xml.js';
  import PropertyWindowContent from './WorkspaceComponents/PropertyWindow.vue'; // Import your property window content component
  import WorkspaceContent from './WorkspaceComponents/WorkspaceContent.vue';

  // when an element is dropped into the workspace workspace_items 
  const workspace_items = ref([]);

  let instance = null; //the jsplumb instance, this is a library which handles the drag and drop as well as the connections 
  let workspaceContentRef = ref(null); // workspace references the workspace DOM-Element which js plumb needs as parent object
  let jsplumbElements = ref([]);

  //object to mark to which elements Endpoints where already added. That why when detecting a change in workspace elemets we know which items are new 
  const managedElements = ref({})

  var selectedElement = ref({});

  const client = axios.create({
    	//baseURL: process.env.VUE_APP_BASE_URL
		baseURL: ''
	});

  
  //handle opening and closing the property window
  const isPropertyWindowOpen = ref(false);
  function openPropertyWindow(){
    isPropertyWindowOpen.value = true;
  };
  function closePropertyWindow(){
    isPropertyWindowOpen.value = false;
  };


  onMounted(() => {
    //nextTick()
    //workspaceContentRef.value.focus();
    
    console.log(jsplumbElements.value)
    console.log("0")
    console.log("1")
    console.log("2")
  });

  
  // Watch for changes in workspaceContentRef
  watch(workspaceContentRef, (newWorkspaceContentRef) => {
    console.log("3")
    if (newWorkspaceContentRef) {
      ready(() => {
        console.log(newWorkspaceContentRef)
        initializeJsPlumb(newWorkspaceContentRef);
        console.log("7")
      })
    }
  });
  
  // Function to initialize jsPlumb
  function initializeJsPlumb(container) {
    console.log("4")
    instance = newInstance({
      container: container.value,
      maxConnections: -1,
      connectionOverlays: [{ type: "Arrow", options: { location: 1 } }],
      connector: "Flowchart"
    });
    console.log("5")
    container.value.style.transform = `scale(1)`;
    console.log("5")
    instance.setZoom(1);
    console.log("6")
  }

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
    console.log(newItems)
    await nextTick(); //wait for next tick to ensure that the newly added items of the workspace item list are actually rendered
    newItems.forEach(item => { //iterate through items
      console.log(jsplumbElements)
      const elementRef = jsplumbElements.value.value.find((element) => {return element.id === item.id}); //find the corresponding DOM element
      if (!managedElements.value[item.id]) {    //check if there are any new items and run the following:
        addJsPlumbEndpoints(elementRef, item)  // add endpoints
        elementRef.style.left = item.x+"px";   //set x to x saved in Ondrop event
        elementRef.style.top = item.y+"px";    //set y to y saved in Ondrop event
        managedElements.value[item.id] = true  //mark as already managed to run this only once
      }
    });
  }
  watch(workspace_items, updateItemList, { deep: true });

  /*
    the following paramters and functions handle the zooming of the workspace
    to zoom the workspace you use the zoomin and zoomout buttons in the upper left corner
  */
  const zoomLevel = ref(1);
  // Zoom in by incrementing the zoom level
  const zoomIn = () => {
    zoomLevel.value += 0.1;
    workspaceContentRef.value.style.transform = `scale(${zoomLevel.value})`;
    instance.setZoom(zoomLevel.value);
    console.log("zoom in");
  };
  // Zoom out by decrementing the zoom level
  const zoomOut = () => {
    zoomLevel.value -= 0.1;
    workspaceContentRef.value.style.transform = `scale(${zoomLevel.value})`;
    instance.setZoom(zoomLevel.value);
    console.log("zoom out");
  };

  /*
    this function does the following:,
      - it creates the batchml
      - validates it by the servers /validate endpoint
        - if its valid downloads it automatically "Verfahrensrezept.xml"
        - if not warns the user by alert box but downloads as "invalid_Verfahrensrezept"
        - if unknown error while creating or validating it gives the user the error message
  */ 
  function export_batchml (){
    create_validate_download_batchml(workspace_items.value, instance.getConnections(), client)
  }
  //expose this funciton so that i can be called from the Topbar export button
  defineExpose({
      export_batchml
  });
</script>




<style>
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

  /* Position buttons and property window */
  .buttons-container {
    position: absolute;
    top: 10px; /* Adjust the top distance as needed */
    left: 10px; /* Adjust the left distance as needed */
    z-index: 2; /* Ensure buttons appear above the workspace content */
  }

  .property-window-enter-active, .property-window-leave-active {
    transition: transform 0.5s ease-in-out; /* Adjust the duration as needed */
  }

  .property-window-enter-from, .property-window-leave-to {
    transform: translateX(100%);
  }
</style>
