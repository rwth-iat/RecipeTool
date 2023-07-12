<script setup>
import { ref, onMounted, onUpdated, watch, nextTick } from 'vue';
import { newInstance, ready } from "@jsplumb/browser-ui";

const workspace_items = ref([]);
let instance = null;
const jsplumbElementEndpoints = ref({});

//need this skip unwrap as using "npm run dev" ref of a v-for will not work. This skips the unwrapping which will otherwise cause an error  
const jsplumbElements = ref([]);
var skipUnwrap = { jsplumbElements }
const managedElements = ref({})

const workspace = ref(null);

onMounted(() => {
  workspace.value.focus();
  console.log(jsplumbElements.value)
  instance = newInstance({
    container: workspace.value,
    connectionOverlays: [{ type:"Arrow", options:{location:1}}] //sets the default connection to an arrow from source to target
  });
});

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
    const sourceEndpoint = instance.addEndpoint(element, {
      source: true,
      anchor: "Bottom",
      endpoint: { type: "Dot" }
    });
    const targetEndpoint = instance.addEndpoint(element, {
      target: true,
      anchor: "Top",
      endpoint: { type: "Dot" }
    });
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


//create an BatchML XML Document containing all Connections and Elements
function export_batchml() {
  // Create an XML document
  var xmlDocument = document.implementation.createDocument(null, 'BatchML');

  // Get the root element
  var rootElement = xmlDocument.documentElement;

  // Iterate over connections and create XML elements
  var connections = instance.getConnections();
  connections.forEach(function (connection) {
    console.log(connection)
    var sourceElementId = connection.sourceId;
    var targetElementId = connection.targetId;

    // Look up the corresponding items in the workspace_items list based on the element IDs
    var sourceItem = workspace_items.value.find(item => item.id === sourceElementId);
    var targetItem = workspace_items.value.find(item => item.id === targetElementId);

    if (sourceItem && targetItem) {
      var sourceId = sourceItem.id; // Retrieve source element ID from the item
      var targetId = targetItem.id; // Retrieve target element ID from the item

      var connectionElement = xmlDocument.createElement('Connection');
      connectionElement.setAttribute('sourceId', sourceId);
      connectionElement.setAttribute('targetId', targetId);
      // You can add more attributes or data to the connectionElement as needed
      rootElement.appendChild(connectionElement);
    }
  });

  // Iterate over workspace items and create XML elements
  workspace_items.value.forEach(function (item) {
    var itemElement = xmlDocument.createElement('Element');
    itemElement.setAttribute('id', item.id);
    itemElement.setAttribute('name', item.name);
    itemElement.setAttribute('type', item.type);
    itemElement.setAttribute('x', item.x);
    itemElement.setAttribute('y', item.y);
    // You can add more attributes or data to the itemElement as needed
    rootElement.appendChild(itemElement);
  });

  // Convert XML document to string
  var serializer = new XMLSerializer();
  var xmlString = serializer.serializeToString(xmlDocument);

  // You can now use the xmlString as needed, e.g., save it to a file
  console.log(xmlString);

  //automatically start download
  var filename = "Verfahrensrezept.xml";
  var pom = document.createElement('a');
  var bb = new Blob([xmlString], {type: 'text/plain'});
  pom.setAttribute('href', window.URL.createObjectURL(bb));
  pom.setAttribute('download', filename);
  pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
  pom.draggable = true; 
  pom.classList.add('dragout');

  pom.click();
}

// TODO: check if this interfers with js plumb drag and drop as it may be called on every drop event
const onDrop = (event) => {
  console.log("Drop");
  event.preventDefault();
  var id = event.dataTransfer.getData("itemID");
  var name = event.dataTransfer.getData("itemName");
  var classes = event.dataTransfer.getData("itemClasses");
  
  var type 
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
</script>

<!--Draw all workspace elements. Connections are drawn by jsplumb in the background-->
<template>
  <div id="workspace" ref="workspace" @drop="$event => onDrop($event)" @dragenter.prevent @dragover.prevent>
    <button @click="export_batchml">
      <span class="toggle-icons">export</span>
    </button>
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
