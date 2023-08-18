//create an BatchML XML Document containing all Connections and Elements
export function export_batchml(workspace_items, jsplumb_connections) {
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
    workspace_items.forEach(function (item) {
      if(item.type == "process"){
        var process_element = xmlDocument.createElement('ProcessElement');
        process_element.setAttribute('id', item.id);
        process_element.setAttribute('name', item.name);
        //process_element.setAttribute('type', item.type);
        for (var connectionId in jsplumb_connections) {
          var connection = jsplumb_connections[connectionId];
          let is_source = connection.sourceId == item.id
          let is_target = connection.targetId == item.id
          if(is_source || is_target){
            var directed_link = xmlDocument.createElement('DirectedLink')
            var id =xmlDocument.createElement('ID')
            id.innerHTML = connectionId
            directed_link.appendChild(id)
            directed_link.appendChild(xmlDocument.createElement('Description'))
            var from_id = xmlDocument.createElement('FromID')
            from_id.innerHTML = connection.sourceId
            var to_id = xmlDocument.createElement('ToID')
            to_id.innerHTML = connection.targetId
            directed_link.appendChild(from_id)
            directed_link.appendChild(to_id)
            process_element.appendChild(directed_link)
            console.log("element connection")
          }else{
            console.log("element has no connection")
          }
        }
        // You can add more attributes or data to the itemElement as needed
        process_procedure.appendChild(process_element);
      }; 
    });
    general_recipe.append(process_procedure)
  
    var elementsWithSourceConnection = [];
    var elementsWithTargetConnection = [];
  
    // Iterate through connections and collect elements
    for (var connectionId in jsplumb_connections) {
      var connection = jsplumb_connections[connectionId];
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
        var workspace_item = workspace_items.find(x => x.id === item.id);
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
  
    /* connections are now printed into the process elements
    // Iterate over connections and create XML elements
    var connections = jsplumb_connections;
    connections.forEach(function (connection) {
      console.log(connection)
      var sourceElementId = connection.sourceId;
      var targetElementId = connection.targetId;
  
      // Look up the corresponding items in the workspace_items list based on the element IDs
      var sourceItem = workspace_items.find(item => item.id === sourceElementId);
      var targetItem = workspace_items.find(item => item.id === targetElementId);
  
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
    */

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