<!--Draw all workspace elements. Connections are drawn by jsplumb in the background-->
<template>
  <div id="workspace" @dragenter.prevent @dragover.prevent>
    <!-- Main workspace where the top level processes are located -->
    <WorkspaceContent
      id="main_workspace"
      v-show="!showSecondaryWorkspace"
      :workspace_items="main_workspace_items"
      @changeSelectedElement="selectedElement = $event" 
      @content-ref="mainWorkspaceContentRef = $event" 
      @jsplumbElements="mainJsplumbElements = $event" 
      @openPropertyWindow="openPropertyWindow"
    />

    <!-- secondary workspace for when the inner steps of a single process are edited -->
    <WorkspaceContent
      id="secondary_workspace"
      v-show="showSecondaryWorkspace"
      :workspace_items="secondary_workspace_items"
      @changeSelectedElement="selectedElement = $event"
      @content-ref="secondaryWorkspaceContentRef = $event"
      @jsplumbElements="secondaryJsplumbElements = $event"  
      @openPropertyWindow="openPropertyWindow"
    />

    <!-- Zoom Buttons-->
    <div class="buttons-container">
      <button class="buttons" @click="zoomIn">Zoom In</button>
      <button class="buttons" @click="zoomOut">Zoom Out</button>
      <button class="buttons" @click="showSecondaryWorkspace=true">show secondary workspace</button>
      <button class="buttons" @click="showSecondaryWorkspace=false">close secondary workspace</button>
    </div>

    <!-- Property window -->
    <div class="property-window-container">
    <transition name="property-window">
      <div v-show="isPropertyWindowOpen" >
        <PropertyWindowContent
        :selectedElement="selectedElement" 
        @close="closePropertyWindow"
        @openInWorkspace="openInWorkspace"/>
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

  //variables for main workspace
  const main_workspace_items = ref([]); // when an element is dropped into the workspace workspace_items
  let mainJsplumbInstance = null; //the jsplumb instance, this is a library which handles the drag and drop as well as the connections 
  let mainWorkspaceContentRef = ref(null); // workspace references the workspace DOM-Element which js plumb needs as parent object
  let mainJsplumbElements = ref([]);
  const mainManagedElements = ref({}) //object to mark to which elements Endpoints where already added. That why when detecting a change in workspace elemets we know which items are new 
  
//variables for secondary workspace
  const secondary_workspace_items = ref([]); // when an element is dropped into the workspace workspace_items
  let secondaryJsplumbInstance = null; //the jsplumb instance, this is a library which handles the drag and drop as well as the connections 
  let secondaryWorkspaceContentRef = ref(null); // workspace references the workspace DOM-Element which js plumb needs as parent object
  let secondaryJsplumbElements = ref([]);
  const secondaryManagedElements = ref({}) //object to mark to which elements Endpoints where already added. That why when detecting a change in workspace elemets we know which items are new 

  
  var selectedElement = ref({});
  const client = axios.create({
    	//baseURL: process.env.VUE_APP_BASE_URL
		baseURL: ''
	});

  const showSecondaryWorkspace = ref(false)
  
  //handle opening and closing the property window
  const isPropertyWindowOpen = ref(false);
  function openPropertyWindow(){
    isPropertyWindowOpen.value = true;
  };
  function closePropertyWindow(){
    isPropertyWindowOpen.value = false;
  };
  
  // Watch for changes in workspaceContentRef
  watch(mainWorkspaceContentRef, (newWorkspaceContentRef) => {
    if (newWorkspaceContentRef) {
      ready(() => {
        mainJsplumbInstance = initializeJsPlumb(newWorkspaceContentRef);
        watch(main_workspace_items, createUpdateItemListHandler(mainJsplumbInstance, mainJsplumbElements, mainManagedElements), {deep: true,});
      })
    }
  });

  // Watch for changes in workspaceContentRef
  watch(secondaryWorkspaceContentRef, (newWorkspaceContentRef) => {
    if (newWorkspaceContentRef) {
      ready(() => {
        secondaryJsplumbInstance = initializeJsPlumb(newWorkspaceContentRef);
        watch(secondary_workspace_items, createUpdateItemListHandler(secondaryJsplumbInstance, secondaryJsplumbElements, secondaryManagedElements), {deep: true,});
    })
    }
  });
  
  // Function to initialize jsPlumb
  function initializeJsPlumb(container) {
    var instance = newInstance({
      container: container.value,
      maxConnections: -1,
      connectionOverlays: [{ type: "Arrow", options: { location: 1 } }],
      connector: "Flowchart"
    });
    container.value.style.transform = `scale(1)`;
    instance.setZoom(1);
    return instance
  }

  function addSourceEndpoint(instance, element){
    const sourceEndpoint = instance.addEndpoint(element, {
        source: true,
        anchor: "Bottom",
        endpoint: { type: "Dot" }
      });
      return sourceEndpoint
  }

  function addTargetEndpoint(instance, element){
    const targetEndpoint = instance.addEndpoint(element, {
        target: true,
        anchor: "Top",
        endpoint: { type: "Dot" }
      });
    return targetEndpoint
  }

  // add endpoints and attach the element id as data to the endpoint. 
  // When exporting to xml we can iterate through the connections and when accessing the source Endpoint and Target endpoint we can now read the corresponding element
  async function addJsPlumbEndpoints(instance, element, item) {
    console.log("entered addJSEndpoints")
    console.log(instance)
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
          console.log("add Eingangsmaterial")
          sourceEndpoint = addSourceEndpoint(instance, element)
          targetEndpoint = {id: ''}
          console.log("added SourceEndpoint")
        }else if(item.name === "Zwischenprodukt"){
          console.log("add Zwischenprodukt")
          sourceEndpoint = addSourceEndpoint(instance, element)
          targetEndpoint = addTargetEndpoint(instance, element)
          console.log("added Source- and Target-Endpoint")
        }else if(item.name === "Endprodukt"){
          console.log("add Endproduct")
          sourceEndpoint = {id: ''}
          targetEndpoint = addTargetEndpoint(instance, element)
          console.log("added TargetEndpoint")
        }else{
          console.error("unknown material type: " + item.name)
        }
      }else if(item.type === "process"){
        console.log("add process")
        sourceEndpoint = addSourceEndpoint(instance, element)
        targetEndpoint = addTargetEndpoint(instance, element)
        console.log("added Source and Target Endpoint")
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

  function createUpdateItemListHandler(instance, jsplumbElements, managedElements) {
  return async (newItems) => {
    console.debug("workspace_items updated, watcher triggered");
    await nextTick();
    newItems.forEach((item) => {
      const elementRef = jsplumbElements.value.value.find(
        (element) => element.id === item.id
      );
      if (!managedElements.value[item.id]) {
        addJsPlumbEndpoints(instance, elementRef, item);
        elementRef.style.left = item.x + "px";
        elementRef.style.top = item.y + "px";
        managedElements.value[item.id] = true;
      }
    });
  };
}

  //watch(secondary_workspace_items, createUpdateItemListHandler(secondary_js_plumb_instance, secondary_js_plumb_elements, secondary_managed_elements), {deep: true,});

  /*
    the following paramters and functions handle the zooming of the workspace
    to zoom the workspace you use the zoomin and zoomout buttons in the upper left corner
  */
  const mainZoomLevel = ref(1);
  const secondaryZoomLevel = ref(1);
  function getZoomVariables(){
    if(!showSecondaryWorkspace.value){
      return [mainZoomLevel, mainWorkspaceContentRef, mainJsplumbInstance]
    }else if(showSecondaryWorkspace.value){
      return [secondaryZoomLevel, secondaryWorkspaceContentRef, secondaryJsplumbInstance]
    }
  }
  // Zoom in by incrementing the zoom level
  const zoomIn = () => {
    var [zoomLevel, workspaceContentRef, jsplumbInstance] = getZoomVariables()
    zoomLevel.value += 0.1;
    console.log(zoomLevel)
    workspaceContentRef.value.value.style.transform = `scale(${zoomLevel.value})`;
    console.log(workspaceContentRef)
    console.log(jsplumbInstance)
    jsplumbInstance.setZoom(zoomLevel.value);
    console.log("zoom in");
  };
  // Zoom out by decrementing the zoom level
  const zoomOut = () => {
    var [zoomLevel, workspaceContentRef, jsplumbInstance] = getZoomVariables()
    zoomLevel.value -= 0.1;
    workspaceContentRef.value.value.style.transform = `scale(${zoomLevel.value})`;
    jsplumbInstance.setZoom(zoomLevel.value);
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
    create_validate_download_batchml(main_workspace_items.value, mainJsplumbInstance.getConnections(), client)
  }
  //expose this funciton so that i can be called from the Topbar export button
  defineExpose({
      export_batchml
  });


  function openInWorkspace(){
    // check if this element already has children processes else define empty list
    if(!Array.isArray(selectedElement.value.processElement)){
      selectedElement.value.processElement = [];
    }
    // check if this element already has children processes else define empty list
    if(!Array.isArray(selectedElement.value.materials)){
      //if no materials exist yet add an input and output knot
      selectedElement.value.materials = [];
      selectedElement.value.materials.push({ id: "IN", name: "Eingangsmaterial", type: "material", x: "100px", y: "100px" })
      selectedElement.value.materials.push({ id: "OUT", name: "Endprodukt", type: "material", x: "200px", y: "200px" })
    }

    //add the materials and the processes to workspace items
    //the ... pushes every single element one by one instead of the whole list as one entry
    secondary_workspace_items.value.push(...selectedElement.value.processElement);
    secondary_workspace_items.value.push(...selectedElement.value.materials);

    //open the actual secondary workspace
    showSecondaryWorkspace.value=true;
  }
</script>




<style>
  #workspace {
    background-color: black;
    position: relative;
    height: calc(100vh - var(--topbar-height));
    flex: 1 1 0;
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    z-index: 0;
  } 
  #main_workspace{
    background-color: white;
  }
  #secondary_workspace{
    background-color: grey;
  }
  .property-window-container {
    position: absolute;
    top: 0px; /* Adjust the top distance as needed */
    right: 0px; /* Adjust the right distance as needed */
    z-index: 2; /* Ensure property window appears above the workspace content */
  }

  /* Position buttons and property window */
  .buttons-container {
    background-color: white;
    position: absolute;
    top: 10px; /* Adjust the top distance as needed */
    left: 10px; /* Adjust the left distance as needed */
    z-index: 2; /* Ensure buttons appear above the workspace content */
  }
  .buttons{
    margin: 10px;
  }

  .property-window-enter-active, .property-window-leave-active {
    transition: transform 0.5s ease-in-out; /* Adjust the duration as needed */
  }

  .property-window-enter-from, .property-window-leave-to {
    transform: translateX(100%);
  }
</style>
