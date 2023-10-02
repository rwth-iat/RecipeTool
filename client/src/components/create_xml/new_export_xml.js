import { Builder } from 'xml2js';
import { Jsonix } from 'jsonix-issue-238-fixed';
import { org_mesa_xml_b2mml} from './org_mesa_xml_b2mml_edited.js';
import { Draft04 } from "json-schema-library";
import allSchemas  from './AllSchemas.json';


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
    let newValueType = {
        "b2mml:ValueString": valueType.valueString,
        "b2mml:DataType": valueType.dataType,
        "b2mml:UnitOfMeasure": valueType.unitOfMeasure,
        "b2mml:Key": valueType.key
    }
    return newValueType
}

function create_material(id, description){
    let materials = {
        "b2mml:ID": id,
        "b2mml:Description": [description],
        "b2mml:MaterialID": "",
        "b2mml:Order": "",
        "b2mml:Amount": {}
        }
    return materials
}

function create_materials(id, description, materials_type){
    let materials = {
            "b2mml:ID": id, 
            "b2mml:Description":[description],
            "b2mml:MaterialsType":materials_type,
            "b2mml:Material":[]
        }
    return materials
}

function create_formula(workspace_items, jsplumb_connections){
    let formula = {
        "b2mml:Description":["The formula defines the Inputs, Intermediates and Outputs of the Procedure"],
        "b2mml:ProcessInputs": create_materials("inputid", "List of Process Inputs", "Input"),
        "b2mml:ProcessOutputs": create_materials("outputsid", "List of Process Outputs", "Output"),
        "b2mml:ProcessIntermediates": create_materials("intermediateid", "List of Process Intermediates", "Intermediate"),
        "b2mml:ProcessElementParameter":[]
    }

    //get list of input and output materials
    const [input_materials, output_materials] = list_source_target(jsplumb_connections)
    
    //add input materials and intermediates
    input_materials.forEach(function (item) {
        if(item.type == "material"){
            //check if material is also output
            if(!output_materials.includes(item)){ 
                formula["b2mml:ProcessInputs"].material.push(
                    create_material(item.id, item.description)
                )
            }
            //if also output material than add to intermediate
            else{
                formula["b2mml:ProcessIntermediates"].material.push(
                    create_material(item.id, item.description)
                )
            }
        }
    });

    //add output materials
    output_materials.forEach(function (item) {
        if(item.type == "material"){ 
            //check if material is only output
            if(!input_materials.includes(item)){ 
                formula["b2mml:ProcessOutputs"].material.push(
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
    let otherInformation = {
        "b2mml:OtherInfoID": item.otherInfoID,
        "b2mml:Description": item.description,
        "b2mml:OtherValue": [createValueType(item.otherValue[0])]
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
        "b2mml:ID": item.id,
        "b2mml:Description": [item.description],
        "b2mml:ProcessElementType": item.processElementType,
        "b2mml:Materials": [],
        "b2mml:DirectedLink": [],
        "b2mml:ProcedureChartElement": [],
        "b2mml:ProcessElement": [],
        "b2mml:ProcessElementParameter": [],
        "b2mml:ResourceConstraint": [],
        "b2mml:OtherInformation": []
    }

    // Parameters
    if (item.processElementParameter){
        item.processElementParameter.forEach(function(parameter){
            process_element["b2mml:ProcessElementParameter"].push(create_process_element_parameter(parameter))
        })
    }

    //add materials
    workspace_items.forEach(function (child_item) {
        if(child_item.type == "material"){  
            process_element["b2mml:Materials"].push(
            {
                "b2mml:ID": child_item.id,
                "b2mml:Description": [child_item.description]
            }
            //materialsType: ""
            )
        }
        });
    
    //add directed links
    for (let connectionId in jsplumb_connections) {
        let connection = jsplumb_connections[connectionId]
        process_element["b2mml:DirectedLink"].push({
            "b2mml:ID": connectionId,
            "b2mml:Description": [],
            "b2mml:FromID": connection.sourceId,
            "b2mml:ToID": connection.targetId
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

            process_element["b2mml:ProcessElement"].push(
                //add child itemlist and connections here here to enable makro steps 
                create_process_element_type(child_item, child_workspace_items, child_item.directedLink)
            )
        } 
    });
    
    //add Other Information
    if(item.otherInformation !== undefined){
        for (let otherInformation of item.otherInformation) {
            process_element["b2mml:OtherInformation"].push(createOtherInformation(otherInformation))
        }
    }
    console.debug(item)

    console.debug("otherInformation: ", process_element["b2mml:OtherInformation"])
    
    //add resourceConstraints
    if(item.resourceConstraint !== undefined){
        for (let resourceConstraint of item.resourceConstraint) {
            process_element["b2mml:ResourceConstraint"].push(createResourceConstraint(resourceConstraint))
        }
    }
    console.debug(process_element["b2mml:ResourceConstraint"])
 

    //return the created Object
    return process_element
}



export function generate_batchml(workspace_items, jsplumb_connections){
    // Create a JavaScript object representing the XML structure
    // removed not yet implemented fiels in "value" to make batchml valid
    //    - lifeCycleState:{},
    //    - header:{},
    let gRecipe ={
        "b2mml:GRecipe":{
            "$": {
                        "xmlns:b2mml": "http://www.mesa.org/xml/B2MML"
            },
            "b2mml:ID": "testID",
            "b2mml:Description": [""],
            "b2mml:GRecipeType": "General",
            "b2mml:Formula": create_formula(workspace_items, jsplumb_connections),
            "b2mml:ProcessProcedure": create_process_element_type({id:"Procedure1", description:"This is the top level ProcessElement", processElementType:"Process", processElementParameter:[], otherInformation:[], resourceConstraint:[]}, workspace_items, jsplumb_connections),
            "b2mml:ResourceConstraint":[],
            "b2mml:OtherInformation":[]
    }}


    function cleanUp(obj) {
        for (var attrKey in obj) {
            var attrValue = obj[attrKey];
            if (attrValue === null || attrValue === "" || attrValue === undefined) {
                delete obj[attrKey];
            } else if (Object.prototype.toString.call(attrValue) === "[object Object]") {
                cleanUp(attrValue);
            } else if (Array.isArray(attrValue)) {
                attrValue.forEach(function (arrayValue) {
                    cleanUp(arrayValue);
                });
            }
        }
    }
    cleanUp(gRecipe)

    const jsonSchema = new Draft04(allSchemas);
    const errors = jsonSchema.validate(gRecipe);
    console.log("json schema validation errors: ", errors)

    // Convert JSON to XML
    const builder = new Builder();
    const xmlString = builder.buildObject(gRecipe);
    console.log("json to xml g-recipe: ", gRecipe)

    console.log("xml String", xmlString)

    console.debug("JSON G-Secipe: ", gRecipe)
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