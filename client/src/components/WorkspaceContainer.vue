<template>
  <div id="workspace" @dragenter.prevent @dragover.prevent>
    <!-- Main workspace where the top level processes are located -->
    <WorkspaceContent
      id="main_workspace"
      ref="mainWorkspaceContent"
      v-show="!showSecondaryWorkspace"
      :workspace_items="main_workspace_items"
      @changeSelectedElement="selectedElement = $event"
      @openPropertyWindow="openPropertyWindow"
    />

    <!-- secondary workspace for when the inner steps of a single process are edited -->
    <WorkspaceContent
      id="secondary_workspace"
      ref="secondaryWorkspaceContent"
      v-show="showSecondaryWorkspace"
      :workspace_items="secondary_workspace_items"
      @changeSelectedElement="selectedElement = $event"
      @openPropertyWindow="openPropertyWindow"
    />

    <!-- Zoom Buttons-->
    <div class="buttons-container">
      <button class="buttons" @click="zoomIn">
        <span class="material-icons">+</span>
      </button>
      <button class="buttons" @click="zoomOut">
        <span class="material-icons">-</span>
      </button>
      <button class="buttons" v-show="showSecondaryWorkspace" @click="showSecondaryWorkspace=false">
        <span class="material-icons" style="color:red">x</span>
      </button>
      <button class="buttons" v-show="showSecondaryWorkspace" @click="saveSecondaryWorkspace">
        <span style="color:green">save</span>
      </button>
    </div>

    <!-- Property window -->
    <div class="property-window-container">
    <transition name="property-window">
      <div v-show="isPropertyWindowOpen" >
        <PropertyWindowContent
        v-model:selectedElement="selectedElement"
        @update:selectedElement="selectedElement = $event" 
        @close="closePropertyWindow"
        @openInWorkspace="openInWorkspace"
        @deleteElement="deleteElement($event)"/>
      </div>
    </transition>
    </div>
  </div>
</template>


<script setup>
  import { ref, nextTick } from 'vue';
  import axios from 'axios'
  import { create_validate_download_batchml } from './create_xml/new_export_xml.js';
  import PropertyWindowContent from './WorkspaceComponents/PropertyWindow.vue'; // Import your property window content component
  import WorkspaceContent from './WorkspaceComponents/WorkspaceContent.vue';

  //variables for main workspace
  const main_workspace_items = ref([]); // when an element is dropped into the workspace workspace_items 
  const mainWorkspaceContent = ref(null)

//variables for secondary workspace
  const secondary_workspace_items = ref([]); // when an element is dropped into the workspace workspace_items  
  const secondaryWorkspaceContent = ref(null)
  const secondaryWorkspaceParent = ref(null)
  
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
  }
  function closePropertyWindow(){
    isPropertyWindowOpen.value = false;
  }

  /*
    the following paramters and functions handle the zooming of the workspace
    to zoom the workspace you use the zoomin and zoomout buttons in the upper left corner
  */
  function zoomIn(){
    if (!showSecondaryWorkspace.value){
      mainWorkspaceContent.value.zoomIn()
    }else{
      secondaryWorkspaceContent.value.zoomIn()      
    }
  }
  function zoomOut(){
    if (!showSecondaryWorkspace.value){
      mainWorkspaceContent.value.zoomOut()
    }else{
      secondaryWorkspaceContent.value.zoomOut()      
    }
  }

  /*
    this function does the following:,
      - it creates the batchml
      - validates it by the servers /validate endpoint
        - if its valid downloads it automatically "Verfahrensrezept.xml"
        - if not warns the user by alert box but downloads as "invalid_Verfahrensrezept"
        - if unknown error while creating or validating it gives the user the error message
  */ 
  function export_batchml (){
    create_validate_download_batchml(main_workspace_items.value, mainWorkspaceContent.value.getConnections(), client)
  }
  //expose this funciton so that i can be called from the Topbar export button
  defineExpose({
      export_batchml
  });


  async function openInWorkspace(){
    await secondaryWorkspaceContent.value.clearWorkspace() //reset secondary workspace
    // check if this element already has children processes else define empty list
    if(!Array.isArray(selectedElement.value.processElement)){
      console.debug("no child processelements: ", selectedElement.value.processElement)
      selectedElement.value.processElement = [];
    }
    // check if this element already has children processes else define empty list
    if(!Array.isArray(selectedElement.value.materials)){
      console.debug("no child materials: ", selectedElement.value.materials)
      //if no materials exist yet add an input and output knot
      selectedElement.value.materials = [];
      var unique_id = secondaryWorkspaceContent.value.createUniqueId()
      selectedElement.value.materials.push({ id: unique_id, name: "Eingangsmaterial", type: "material", x: 300, y: 100 })
      unique_id = secondaryWorkspaceContent.value.createUniqueId()
      selectedElement.value.materials.push({ id: unique_id, name: "Endprodukt", type: "material", x: 300, y: 400 })
    }

    await nextTick();
    await nextTick();
    //reset secondary workspace variables
    await secondaryWorkspaceContent.value.addElements(selectedElement.value.materials) //add materials to workspace item list
    await secondaryWorkspaceContent.value.addElements(selectedElement.value.processElement) //add processes to workspace item list
    await secondaryWorkspaceContent.value.addConnections(selectedElement.value.directedLink)
    showSecondaryWorkspace.value=true;//visually open the actual secondary workspace
    secondaryWorkspaceParent.value = selectedElement.value;//set the current parent
  }

  //function needed to replace the original item with the edited item 
  var map = {};
  (function recurse(processElements) {
    for (var i=0; i<processElements.length; i++) {
        var processElement = processElements[i];
        map[ processElement.id ] = processElement;
        if ("processElement" in processElement)
            recurse(processElement.processElement);
    }
  })(main_workspace_items.value);
  
  function updateObjectByID(id, newobj) {
    map[id] = newobj;
  }


  function saveSecondaryWorkspace(){
    //build the parent object
    console.debug("Saving secondary Workspace: ", secondary_workspace_items.value)
    secondaryWorkspaceParent.value.materials = []
    secondaryWorkspaceParent.value.processElement = []
    for(var element of secondary_workspace_items.value){
      console.debug("adding element: ", element)
      if (element.type == "material"){
        console.debug("adding as material")
        secondaryWorkspaceParent.value.materials.push(element)
      }else if(element.type == "process"){
        console.debug("adding as process")
        secondaryWorkspaceParent.value.processElement.push(element)
      }else{
        console.debug("type not known")
      }
    }
    
    secondaryWorkspaceParent.value.directedLink = secondaryWorkspaceContent.value.getConnections()

    //replace original parent obj with the new build
    updateObjectByID(secondaryWorkspaceParent.value.id, secondaryWorkspaceParent.value)
    console.debug("complete workspace parent object right before saving:", secondaryWorkspaceParent.value)
    console.debug("inserting into Main Workspace items: ", main_workspace_items.value)
  }

  function deleteElement(element){
    //try to delete it in both workspaces. As ids are unique and only toplevel of elements are searched this will delete only in one of the two
    mainWorkspaceContent.value.deleteElement(element)
    secondaryWorkspaceContent.value.deleteElement(element)
  }
</script>




<style>
	.material-icons {
        font-size: 2rem;
        color: var(--dark);
        transition: 0.2s ease-in-out;
    }
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
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    background-color: white;
    position: absolute;
    align-items: center;
    top: 10px; /* Adjust the top distance as needed */
    left: 10px; /* Adjust the left distance as needed */
    z-index: 2; /* Ensure buttons appear above the workspace content */
  }
  .buttons{
    margin: 10px;
    vertical-align: middle;
  }

  .property-window-enter-active, .property-window-leave-active {
    transition: transform 0.5s ease-in-out; /* Adjust the duration as needed */
  }

  .property-window-enter-from, .property-window-leave-to {
    transform: translateX(100%);
  }
</style>
