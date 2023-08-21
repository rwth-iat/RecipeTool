function create_Element_with_inner_HTML(xmlDocument, name, innerHTML){
  if (innerHTML !== undefined){
    console.log("innerHTML defined")
    var element = xmlDocument.createElement(name)
    element.innerHTML = innerHTML
    return element
  }else{
    console.log("innerHTML undefined, return undefined")
    return undefined
  }
}

function append_Element_if_exists(parent, children){
  if (children === undefined){
    return parent
  }else{
    console.log("append nothing to " + parent.nodeName +" as child is none")
  }
  // if it is list append all children
  console.log("append child " + children.nodeName + " to " + parent.nodeName)
  if(Array.isArray(children)){
    // if it is list append all children
    children.forEach(child => {
      parent.appendChild(child)
    })
  }else{
    // if it is just one object append directly
    console.log("not an array")
    console.log(children)
    parent.appendChild(children)
  }
  return parent
}

function create_materials_type(xmlDocument, name, materials){
  if (materials === undefined){
    return undefined
  }
  var materials_type = xmlDocument.createElement(name)
  materials_type = append_Element_if_exists(materials_type, create_Element_with_inner_HTML(xmlDocument, "ID", materials.ID))
  materials_type = append_Element_if_exists(materials_type,create_Element_with_inner_HTML(xmlDocument, "Description",  "test"))
  materials_type = append_Element_if_exists(materials_type,create_Element_with_inner_HTML(xmlDocument, "MaterialsType",  materials.MaterialsType))
  materials_type = append_Element_if_exists(materials_type,create_Element_with_inner_HTML(xmlDocument, "material", "testmaterial"))
  return materials_type
}

function create_directed_link(xmlDocument, name, directed_link){
  if (directed_link === undefined){
    return undefined
  }
  var directed_link_xml_obj = xmlDocument.createElement(name)
  directed_link_xml_obj = append_Element_if_exists(directed_link_xml_obj, create_Element_with_inner_HTML(xmlDocument, "ID", directed_link.ID))
  directed_link_xml_obj = append_Element_if_exists(directed_link_xml_obj, create_Element_with_inner_HTML(xmlDocument, "Description",  directed_link.Description))
  directed_link_xml_obj = append_Element_if_exists(directed_link_xml_obj, create_Element_with_inner_HTML(xmlDocument, "FromID",  directed_link.FromID))
  directed_link_xml_obj = append_Element_if_exists(directed_link_xml_obj, create_Element_with_inner_HTML(xmlDocument, "ToID", directed_link.ToID))
  return directed_link_xml_obj
}

function create_process_element_type(xmlDocument, name, process_element){
  if (process_element === undefined){
    return undefined
  }
  //only supports micro steps yet
  //therefore fields for makro steps are not yet filled
  var process_element_type = xmlDocument.createElement(name)
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "ID", process_element.ID))
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "Description", process_element.Description))
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "ProcessElementType", process_element.ProcessElementType))
  
  // IF MAKRO
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "LifeCycleState", process_element.LifeCycleState))
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "SequenceOrder", process_element.SequenceOrder))
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "SequencePath", process_element.SequencePath))
  process_element_type = append_Element_if_exists(process_element_type, create_materials_type(xmlDocument, "Materials", process_element.Materials))
  process_element_type = append_Element_if_exists(process_element_type, add_list(create_directed_link, xmlDocument, "DirectedLink", process_element.DirectedLink))
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "ProcedureChartElement", process_element.ProcedureChartElement))
  console.log(process_element.ProcessElement)
  process_element_type = append_Element_if_exists(process_element_type, create_process_element_types(xmlDocument, "ProcessElement", process_element.ProcessElement))
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "ProcessElementParameter", process_element.ProcessElementParameter))
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "RessouceConstraint", process_element.RessouceConstraint))
  process_element_type = append_Element_if_exists(process_element_type, create_Element_with_inner_HTML(xmlDocument, "OtherInformation", process_element.OtherInformation))
  console.log(process_element_type)
  return process_element_type
}

function add_list(add_element_function, xmlDocument, name, element_list){
  if (element_list === undefined){
    return undefined
  }
  var elements = []
  if (Array.isArrayelement_list){
    element_list.forEach(element =>{
      elements.push(add_element_function(xmlDocument, name, element))
    })
  }else{
    console.log("not an array")
    elements.push(add_element_function(xmlDocument, name, element_list))
  }
 return elements
}

function create_process_element_types(xmlDocument, name, process_elements){
  if (process_elements === undefined){
    return undefined
  }
  var elements = []
  if (Array.isArray(process_elements)){
    process_elements.forEach(process_element =>{
      elements.push(create_process_element_type(xmlDocument, name, process_element))
    })
  }else{
    console.log("not an array")
    elements.push(create_process_element_type(xmlDocument, name, process_elements))
  }
 return elements
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
  mod_log.appendChild(create_Element_with_inner_HTML(xmlDocument, "ModifiedDate", ""))
  mod_log.appendChild(create_Element_with_inner_HTML(xmlDocument, "Author", ""))
  header.appendChild(mod_log)

  //aproval History
  var approval_history = xmlDocument.createElement('ApprovalHistory')
  approval_history.appendChild(create_Element_with_inner_HTML(xmlDocument, "FinalApprovalDate", ""))
  approval_history.appendChild(create_Element_with_inner_HTML(xmlDocument, "Version", ""))
  //individual approval
  var individual_approval = xmlDocument.createElement('IndividualApproval');
  individual_approval.appendChild(create_Element_with_inner_HTML(xmlDocument, "ApprovedBy", ""))
  individual_approval.appendChild(create_Element_with_inner_HTML(xmlDocument, "ApprovalDate", ""))
  approval_history.appendChild(individual_approval)
  header.appendChild(approval_history)

  header.appendChild(create_Element_with_inner_HTML(xmlDocument, "EffectiveDate", ""))
  header.appendChild(create_Element_with_inner_HTML(xmlDocument, "ProductID", ""))
  header.appendChild(create_Element_with_inner_HTML(xmlDocument, "ProductName", ""))
  
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
  create_materials_type(xmlDocument, "Materials", {
    "Name": "Materials",
    "ID": "testid", 
    "MaterialsType": "testMaterialstype"
  })
  formula.appendChild(process_inputs)

  //ProcessOutputs (set of MaterialsType)
  var process_outputs = xmlDocument.createElement('ProcessOutputs')
  //HERE FOR LOOP
  create_materials_type(xmlDocument, "Materials", {
    "Name": "Materials",
    "ID": "testid", 
    "MaterialsType": "testMaterialstype"
  })
  formula.appendChild(process_outputs)

  //ProcessIntermediates (set of MaterialsType)
  var process_intermediates = xmlDocument.createElement('ProcessIntermediates')
  //HERE FOR LOOP
  create_materials_type(xmlDocument, "Materials", {
    "Name": "Materials",
    "ID": "testid", 
    "MaterialsType": "testMaterialstype"
  })
  formula.appendChild(process_intermediates)

  //ProcessElementParameter
  var process_intermediates = xmlDocument.createElement('ProcessElementParameter')
  //TODO: ProcessElementParameter
  formula.appendChild(process_intermediates)
  return formula
}


function create_process_procedure(xmlDocument, workspace_items, jsplumb_connections){
  //Prozess Procedure
  var process_procedure_obj = {
    "Name": "ProcessProcedure",
    "ID": "", 
    "ProcessElementType": "Process Procedure"
  }

  // Iterate over workspace items to create XML elements
  var process_elements = []
  workspace_items.forEach(function (item) {
    if(item.type == "process"){
      process_elements.push(
        {
          "Name": "ProcessElement",
          "ID": item.id, 
          "ProcessElementType": "Process Action"
        }
      )
    }; 
  });

  process_procedure_obj.ProcessElement = process_elements

  // Iterate over workspace items to create Material XML elements
  var materials = [] 
  workspace_items.forEach(function (item) {
    if(item.type == "material"){
      
      materials.push(
        {
          "Name": "Materials",
          "ID": item.id, 
          "MaterialsType": "testMaterialstype"
        }
      )
    }; 
  });
  process_procedure_obj.Materials = materials

  // Iterate over connections and create Directed Links
  var directed_links = []
  for (var connectionId in jsplumb_connections) {
    var connection = jsplumb_connections[connectionId]
    directed_links.push(
      {
        "Name":"DirectedLink",
        "ID": connectionId,
        "Description": "",
        "FromID": connection.sourceId,
        "ToID": connection.targetId
      }
    )
  }
  
  process_procedure_obj.DirectedLink = directed_links

  return create_process_element_type(xmlDocument, "ProcessProcedure", process_procedure_obj)
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
    general_recipe.appendChild(formula)

    //Process Procedure
    var process_procedure = create_process_procedure(xmlDocument, workspace_items, jsplumb_connections)
    console.log(process_procedure)
    general_recipe.appendChild(process_procedure)
  
    //Other information
    var other_information = xmlDocument.createElement('OtherInformation')
    general_recipe.appendChild(other_information)
  
    //Process Element Parameter
    var process_element_parameter = xmlDocument.createElement('ProzessElementParameter')
    general_recipe.appendChild(process_element_parameter)
  
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