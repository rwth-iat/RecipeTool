function create_Element_with_inner_HTML(xmlDocument, name, innerHTML){
  var element = xmlDocument.createElement(name)
  element.innerHTML = innerHTML
  return element
}

function create_materials_type(xmlDocument, name){
    var materials_type = xmlDocument.createElement(name)
    //ID
    materials_type.append(create_Element_with_inner_HTML(xmlDocument, "ID", "testid"))
    //Description
    materials_type.append(create_Element_with_inner_HTML(xmlDocument, "Description", "testdescription"))
    //MaterialsType
    materials_type.append(create_Element_with_inner_HTML(xmlDocument, "MaterialsType", "testmaterialstype"))
    //Material
    materials_type.append(create_Element_with_inner_HTML(xmlDocument, "material", "testmaterial"))
}

function list_source_target(jsplumb_connections) {
  //check wether elements are inputs, outputs, or intermediates
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
  return [elementsWithSourceConnection, elementsWithTargetConnection]
}

function create_header(xmlDocument){
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
  return header
}

function create_formula(xmlDocument, workspace_items, jsplumb_connections){
  var formula = xmlDocument.createElement('Formula')
  
  //Description
  var description = xmlDocument.createElement('Description')
  formula.appendChild(description)

  //ProcessInputs (set of MaterialsType)
  var process_inputs = xmlDocument.createElement('ProcessInputs')
  //HERE FOR LOOP
  create_materials_type(xmlDocument, "Materials")
  formula.appendChild(process_inputs)

  //ProcessOutputs (set of MaterialsType)
  var process_outputs = xmlDocument.createElement('ProcessOutputs')
  //HERE FOR LOOP
  create_materials_type(xmlDocument, "Materials")
  formula.appendChild(process_outputs)

  //ProcessIntermediates (set of MaterialsType)
  var process_intermediates = xmlDocument.createElement('ProcessIntermediates')
  //HERE FOR LOOP
  create_materials_type(xmlDocument, "Materials")
  formula.appendChild(process_intermediates)

  //ProcessElementParameter
  var process_intermediates = xmlDocument.createElement('ProcessElementParameter')
  //TODO: ProcessElementParameter
  formula.appendChild(process_intermediates)
  return formula
}

function create_process_procedure(xmlDocument, workspace_items, jsplumb_connections){
  //Prozess Procedure
  var process_procedure = xmlDocument.createElement('ProcessProcedure')

  // Iterate over workspace items to create XML elements
  workspace_items.forEach(function (item) {
    if(item.type == "process"){
      var process_element = xmlDocument.createElement('ProcessElement');
      process_element.setAttribute('id', item.id);
      process_element.setAttribute('name', item.name);
      //process_element.setAttribute('type', item.type);
      // You can add more attributes or data to the itemElement as needed
      process_procedure.appendChild(process_element);
    }; 
  });

  // Iterate over workspace items to create Material XML elements
  workspace_items.forEach(function (item) {
    if(item.type == "material"){
      var materials = xmlDocument.createElement('materials');
      var id = xmlDocument.createElement('ID')
      id.innerHTML = item.id
      materials.appendChild(id)
      var description = xmlDocument.createElement('Description')
      materials.appendChild(description)

      var materials_type= xmlDocument.createElement('MaterialsType')
      materials_type.innerHTML = "testMaterialstype"

      // You can add more attributes or data to the itemElement as needed
      process_procedure.appendChild(materials);
    }; 
  });

  // Iterate over connections and create Directed Links
  for (var connectionId in jsplumb_connections) {
    var connection = jsplumb_connections[connectionId];
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
      process_procedure.appendChild(directed_link)
  }
  return process_procedure
}


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
    var header = create_header(xmlDocument)
    general_recipe.appendChild(header);
  
    //formula
    var formula = create_formula(xmlDocument, workspace_items, jsplumb_connections)
    general_recipe.append(formula)

    //Process Procedure
    var process_procedure = create_process_procedure(xmlDocument, workspace_items, jsplumb_connections)
    general_recipe.append(process_procedure)
  
    //Other information
    var other_information = xmlDocument.createElement('OtherInformation')
    general_recipe.append(other_information)
  
    //Process Element Parameter
    var process_element_parameter = xmlDocument.createElement('ProzessElementParameter')
    general_recipe.append(process_element_parameter)
  
    batchML.appendChild(general_recipe)

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