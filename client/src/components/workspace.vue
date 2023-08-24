<script setup>
  import { ref, onMounted, onUpdated, watch, nextTick } from 'vue';
  import axios from 'axios'
  import { newInstance, ready } from "@jsplumb/browser-ui";
  import { generate_batchml } from './create_xml/new_export_xml.js';

  // when an element is dropped into the workspace workspace_items 
  const workspace_items = ref([]);

  let instance = null; //the jsplumb instance, this is a library which handles the drag and drop as well as the connections 
  const workspace = ref(null); // workspace references the workspace DOM-Element which js plumb needs as parent object

  //need this as the developer server "npm run dev" will run into error using a normal ref of a v-for. This skips the unwrapping
  const jsplumbElements = ref([]);
  var skipUnwrap = { jsplumbElements }
  //object to mark to which elements Endpoints where already added. That why when detecting a change in workspace elemets we know which items are new 
  const managedElements = ref({})

  const client = axios.create({
    	//baseURL: process.env.VUE_APP_BASE_URL
		baseURL: ''
	});


  onMounted(() => {
    workspace.value.focus();
    console.log(jsplumbElements.value)
    instance = newInstance({
      container: workspace.value,
      maxConnections: -1,
      connectionOverlays: [{ type:"Arrow", options:{location:1}}] //sets the default connection to an arrow from source to target
    });
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
    var jsplumb_connections = 
    console.log(items)
    var xml_string = generate_batchml(items, jsplumb_connections)
    client.get('/validate', {
            params: {
              "xml_string": xml_string
            }
      }).then(response => {
        console.log(response)
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
          }else{
            // handle error
            console.log("error trying to validate the BatchML file")
            console.log(error)
          }
      })
  }
  defineExpose({
    export_batchml
  });
</script>





<!--Draw all workspace elements. Connections are drawn by jsplumb in the background-->
<template>
  <div id="workspace" ref="workspace" @drop="$event => onDrop($event)" @dragenter.prevent @dragover.prevent>
    <div :class="'workspace_element ' + item.type" v-for="item in workspace_items" :key="item.id" :ref=" skipUnwrap.jsplumbElements" :id="item.id">
      {{ item.name }}
    </div>
  </div>
</template>





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
    width: 100vw;
    height: calc(100vh - var(--topbar-height));
    flex: 1 1 0;
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    background-size: 40px 40px;
    background-image: radial-gradient(circle, #000 1px, rgba(0, 0, 0, 0) 1px);
  }


  .workspace_element {
    display: flex;
    position: absolute;
    text-align: center;
    justify-content: center;
    align-items: center;
  }
</style>
