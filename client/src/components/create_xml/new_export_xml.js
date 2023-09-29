import { Jsonix } from 'jsonix-issue-238-fixed';
import { org_mesa_xml_b2mml} from './org_mesa_xml_b2mml_edited.js';

/*
This function is mainly used to determine input, output and intermediate materials for the "formula" object.
Given the jsplumb connections, this function returns two lists:
    - one with the elements that have an connection at their sourceEndpoint making them "Input" elements
    - one with the elements that have an connection at their targetEndpoint making them "Output" elements
*/
function list_source_target(jsplumb_connections) {
    //check wether elements are inputs, outputs, or intermediates
    let elementsWithSourceConnection = [];
    let elementsWithTargetConnection = [];
  
    // Iterate through connections and collect elements
    for (let connectionId in jsplumb_connections) {
      let connection = jsplumb_connections[connectionId];
      let sourceId = connection.sourceId;
      let targetId = connection.targetId;
  
      // Find source and target elements
      let sourceElement = document.getElementById(sourceId);
      let targetElement = document.getElementById(targetId);
  
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

function createValueType(valueType){
    let newValueType = {}
    newValueType.valueString = valueType.valueString 
    //newValueType.dataType = valueType.dataType
    //newValueType.unitOfMeasure = valueType.unitOfMeasure
    newValueType.key = valueType.key
    return newValueType
}

function create_material(id, description){
    let materials = {
        id: id,
        description: [description],
        materialID: "",
        order: "",
        amount: {}
        }
    return materials
}

function create_materials(id, description, materials_type){
    let materials = {
            id: id, 
            description:[description],
            materialsType:materials_type,
            material:[]
        }
    return materials
}

function create_formula(workspace_items, jsplumb_connections){
    let formula = {
        description:["The formula defines the Inputs, Intermediates and Outputs of the Procedure"],
        processInputs:{},
        processOutputs:{},
        processIntermediates:{},
        processElementParameter:[]
    }

    //get list of input and output materials
    const [input_materials, output_materials] = list_source_target(jsplumb_connections)
    
    //add input materials and intermediates
    formula.processInputs = create_materials("inputid", "List of Process Inputs", "Input")
    formula.processIntermediates = create_materials("intermediateid", "List of Process Intermediates", "Intermediate")
    input_materials.forEach(function (item) {
        if(item.type == "material"){
            //check if material is also output
            if(!output_materials.includes(item)){ 
                formula.processInputs.material.push(
                    create_material(item.id, item.description)
                )
            }
            //if also output material than add to intermediate
            else{
                formula.processIntermediates.material.push(
                    create_material(item.id, item.description)
                )
            }
        }
    });

    //add output materials
    formula.processOutputs = create_materials("outputsid", "List of Process Outputs", "Output")
    output_materials.forEach(function (item) {
        if(item.type == "material"){ 
            //check if material is only output
            if(!input_materials.includes(item)){ 
                formula.processOutputs.material.push(
                    create_material(item.id, item.description)
                )
            }
            //here we dont add the intermediates, as they were already added with the process inputs
        }
    });
    return formula
}
function create_process_element_parameter(item){
    let parameter = {
        id: item.id,
        description: item.description,
        value: [createValueType(item.value)]
    }
    console.debug("processParameter:", parameter)
    return parameter
}
function createOtherInformation(item){
    let otherInformation = {}
    otherInformation.otherInfoID = item.otherInfoID;
    if(Array.isArray(item.description)){
        otherInformation.description = item.description;
    }else if(typeof item.description === "string"){
        otherInformation.description = [item.description]
    }else{
        console.error("otherinformation.description is of unknown type", item)
    }
    otherInformation.otherValue = [];
    for(let otherValue of item.otherValue){
        otherInformation.otherValue.push(createValueType(otherValue));    
    }
    return otherInformation;
}


function createResourceConstraint(item){
    let resourceConstraint = {
        constraintID: item.id,
        description: [item.description[0]], // put in array as array input is not implemented in editor yet
        constraintType: [item.constraintType],
        lifeCycleState: {},
        range: [createValueType(item.range)], //put in array as array input is not implemented in editor yet 
        resourceContraintProperty: [{}] //put it in array as array inputs are not implemented into editor yet. Object not implemented yet 
    }
    return resourceConstraint
}

export function create_process_element_type(item, workspace_items, jsplumb_connections){
    // removed yet unimplemented fields which caused invalid xml
    //     - lifeCycleState:{},
    //     - sequenceOrder: {},
    //     - sequencePath: {},
    let process_element = {
        id: item.id,
        description: [item.description],
        processElementType: item.processElementType,
        materials: [],
        directedLink: [],
        procedureChartElement: [],
        processElement: [],
        processElementParameter: [],
        resourceConstraint: [],
        otherInformation: []
    }

    // Parameters
    if (item.processElementParameter){
        item.processElementParameter.forEach(function(parameter){
            process_element.processElementParameter.push(create_process_element_parameter(parameter))
        })
    }

    //add materials
    workspace_items.forEach(function (child_item) {
        if(child_item.type == "material"){  
            process_element.materials.push(
            {
                id: child_item.id,
                description: [child_item.description]
            }
            //materialsType: ""
            )
        }
        });
    
    //add directed links
    for (let connectionId in jsplumb_connections) {
        let connection = jsplumb_connections[connectionId]
        process_element.directedLink.push({
            id: connectionId,
            description: [],
            fromID: connection.sourceId,
            toID: connection.targetId
        })
    }

    //add Process Elements
    workspace_items.forEach(function (child_item) {
        if(child_item.type == "process"){
            let child_workspace_items = []
            if(child_item.materials){
                child_workspace_items.push(...child_item.materials)
            }
            if(child_item.processElement){
                child_workspace_items.push(...child_item.processElement)
            }

            process_element.processElement.push(
                //add child itemlist and connections here here to enable makro steps 
                create_process_element_type(child_item, child_workspace_items, child_item.directedLink)
            )
        } 
    });

    //add Other Information
    if(item.otherInformation !== undefined){
        for (let otherInformation of item.otherInformation) {
            process_element.otherInformation.push(createOtherInformation(otherInformation))
        }
    }
    console.debug(item)
    console.debug("otherInformation: ", process_element.otherInformation)
    
    //add resourceConstraints
    if(item.resourceConstraint !== undefined){
        for (let resourceConstraint of item.resourceConstraint) {
            process_element.resourceConstraint.push(createResourceConstraint(resourceConstraint))
        }
    }
    console.debug(process_element.resourceConstraint)
 
    //return the created Object
    return process_element
}



export function generate_batchml(workspace_items, jsplumb_connections){
    // Create a Jsonix context
    const context = new Jsonix.Context([org_mesa_xml_b2mml]);

    // Create a JavaScript object representing the XML structure
    // removed not yet implemented fiels in "value" to make batchml valid
    //    - lifeCycleState:{},
    //    - header:{},
    const gRecipe ={
        name: {
            key: "{http://www.mesa.org/xml/B2MML}GRecipe",
            localPart: "GRecipe",
            namespaceURI: "http://www.mesa.org/xml/B2MML",
            prefix: "",
            string: "{http://www.mesa.org/xml/B2MML}GRecipe"
        },
        value: {
            id: {},
            description: [{}],
            gRecipeType: "General",
            formula: create_formula(workspace_items, jsplumb_connections),
            processProcedure: create_process_element_type({id:"Procedure1", description:"This is the top level ProcessElement", processElementType:"Process", processElementParameter:[], otherInformation:[], resourceConstraint:[]}, workspace_items, jsplumb_connections),
            resourceConstraint:[{}],
            otherInformation:[{}]
        }
    }
    console.debug("JSON G-Secipe: ", gRecipe)
    console.debug("rigth before marschalling")
    // Marshal the JavaScript object to XML
    const marshaller = context.createMarshaller();
    const xmlString = marshaller.marshalString(gRecipe);
    return xmlString
}

export function start_download(filename, file_string){
    //automatically start download
    let pom = document.createElement('a');
    let bb = new Blob([file_string], {type: 'text/plain'});
    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);
    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true; 
    pom.classList.add('dragout');
    pom.click();
    return;
}

export function create_validate_download_batchml(items, jsplumb_connections, client){
    let xml_string = generate_batchml(items, jsplumb_connections)
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
            start_download("unchecked_Verfahrensrezept.xml", xml_string) 
            window.alert("Error 404: Unable to reach the server, when validating the Batchml. Are you maybe only running the client code? For complete error message look into the browser devtools console")
          }else{
            // handle error
            console.log("error trying to validate the BatchML file:")
            console.log(error)
            window.alert("Error: The Batchml could not be validated. For complete error message look into the browser devtools console.")
          }
      })
  }