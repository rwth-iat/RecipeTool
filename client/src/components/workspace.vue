<script setup>
import { ref, onMounted, onUpdated, watch, nextTick } from 'vue';
import { newInstance, ready } from "@jsplumb/browser-ui";

// when an element is dropped into the workspace workspace_items 
const workspace_items = ref([]);

let instance = null; //the jsplumb instance, this is a library which handles the drag and drop as well as the connections 
const workspace = ref(null); // workspace references the workspace DOM-Element which js plumb needs as parent object

//need this as the developer server "npm run dev" will run into error using a normal ref of a v-for. This skips the unwrapping
const jsplumbElements = ref([]);
var skipUnwrap = { jsplumbElements }
//object to mark to which elements Endpoints where already added. That why when detecting a change in workspace elemets we know which items are new 
const managedElements = ref({})

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


//create an BatchML XML Document containing all Connections and Elements
function export_batchml() {
  // Create an XML document
  var xmlDocument = document.implementation.createDocument("", "BatchInformation");
  
  // Specify the XML version at the top
  const xmlDeclaration = xmlDocument.createProcessingInstruction('xml', 'version="1.0"');
  xmlDocument.insertBefore(xmlDeclaration, xmlDocument.firstChild);
  
  // Get the root element
  var batchML = xmlDocument.documentElement;
  var general_recipe = xmlDocument.createElement('GeneralRecipe')
  
  //append top level elements
  general_recipe.appendChild(xmlDocument.createElement('Description'));
  general_recipe.appendChild(xmlDocument.createElement('ID'));
  general_recipe.appendChild(xmlDocument.createElement('Version'));
  
  //create header and append
  var header = xmlDocument.createElement('Header')
  //modification log
  var mod_log = xmlDocument.createElement('ModificationLog')
  mod_log.appendChild(xmlDocument.createElement("ModifiedDate"));
  mod_log.appendChild(xmlDocument.createElement("Author"));
  header.appendChild(mod_log)
  //aproval History
  var approval_history = xmlDocument.createElement('ApprovalHistory')
  approval_history.appendChild(xmlDocument.createElement('FinalApprovalDate'));
  approval_history.appendChild(xmlDocument.createElement('Version'));
  //individual approval
  var individual_approval = xmlDocument.createElement('IndividualApproval');
  individual_approval.appendChild(xmlDocument.createElement('ApprovedBy'));
  individual_approval.appendChild(xmlDocument.createElement('ApprovalDate'));
  approval_history.appendChild(individual_approval)
  header.appendChild(approval_history)

  header.appendChild(xmlDocument.createElement('EffectiveDate'));
  header.appendChild(xmlDocument.createElement('ProductID'));
  header.appendChild(xmlDocument.createElement('ProductName'));
  
  // batch size
  var batch_size = xmlDocument.createElement('BatchSize');
  batch_size.appendChild(xmlDocument.createElement('Nominal'));
  batch_size.appendChild(xmlDocument.createElement('Normal'));
  batch_size.appendChild(xmlDocument.createElement('Min'));
  batch_size.appendChild(xmlDocument.createElement('Max'));
  batch_size.appendChild(xmlDocument.createElement('ScaleReference'));
  batch_size.appendChild(xmlDocument.createElement('ScaledSize'));
  batch_size.appendChild(xmlDocument.createElement('UnitOfMeasure'));
  header.appendChild(batch_size)

  general_recipe.appendChild(header);

  //Prozess Procedure
  var process_procedure = xmlDocument.createElement('ProcessProcedure')
    // Iterate over workspace items and create XML elements
    workspace_items.value.forEach(function (item) {
      if(item.type == "process"){
        var process_element = xmlDocument.createElement('ProcessElement');
        process_element.setAttribute('id', item.id);
        process_element.setAttribute('name', item.name);
        process_element.setAttribute('type', item.type);
        // You can add more attributes or data to the itemElement as needed
        process_procedure.appendChild(process_element);
      }
    });
  general_recipe.append(process_procedure)

  // Assuming you have a list of elements and connections
  var connections = instance.getConnections();

  var elementsWithSourceConnection = [];
  var elementsWithTargetConnection = [];

  // Iterate through connections and collect elements
  for (var connectionId in connections) {
    var connection = connections[connectionId];
    var sourceId = connection.sourceId;
    var targetId = connection.targetId;

    // Find source and target elements
    var sourceElement = document.getElementById(sourceId);
    var targetElement = document.getElementById(targetId);

    // Check if source element already added to list
    if (elementsWithSourceConnection.indexOf(sourceElement) === -1) {
      elementsWithSourceConnection.push(sourceElement);
    }

    // Check if target element already added to list
    if (elementsWithTargetConnection.indexOf(targetElement) === -1) {
      elementsWithTargetConnection.push(targetElement);
    }
  }

  console.log("Elements with source connection:", elementsWithSourceConnection);
  console.log("Elements with target connection:", elementsWithTargetConnection);

  // Adds either input or output materials to xml file
  function add_materials_to_xml(root_element, workspace_items, elements_list, material_type){
    var materials = xmlDocument.createElement(material_type)
    elements_list.forEach(function (item) {
      var workspace_item = workspace_items.value.find(x => x.id === item.id);
      if(workspace_item.type == "material"){
        var process_element = xmlDocument.createElement('ProcessElement');
        process_element.setAttribute('id', workspace_item.id);
        process_element.setAttribute('name', workspace_item.name);
        process_element.setAttribute('type', workspace_item.type);
        // You can add more attributes or data to the itemElement as needed
        materials.appendChild(process_element);
      }
    });
    root_element.append(materials)
  }

  //process_inputs
  add_materials_to_xml(general_recipe, workspace_items, elementsWithSourceConnection, "ProcessInputs")

  //process outputs
  add_materials_to_xml(general_recipe, workspace_items, elementsWithTargetConnection, "ProcessOutputs")

  //Other information
  var other_information = xmlDocument.createElement('OtherInformation')
    //process_outputs.appendChild()
  general_recipe.append(other_information)

  //Process Element Parameter
  var process_element_parameter = xmlDocument.createElement('ProzessElementParameter')
    //process_outputs.appendChild()
  general_recipe.append(process_element_parameter)

  //Process Intermediate
  var prozess_intermediate = xmlDocument.createElement('ProzessIntermediate')
    //process_outputs.appendChild()
  general_recipe.append(prozess_intermediate)

  batchML.appendChild(general_recipe)


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
      batchML.appendChild(connectionElement);
    }
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
</script>

<!--Draw all workspace elements. Connections are drawn by jsplumb in the background-->
<template>
  <div id="workspace" ref="workspace" @drop="$event => onDrop($event)" @dragenter.prevent @dragover.prevent>
    <button @click="export_batchml" id="export_button">
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
