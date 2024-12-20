import { Builder } from 'xml2js';
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

function createAmount(valueType){
    let newAmount = {
        "b2mml:QuantityString": valueType.valueString,
        "b2mml:DataType": valueType.dataType,
        "b2mml:UnitOfMeasure": valueType.unitOfMeasure,
        "b2mml:Key": valueType.key
    }
    return newAmount
}

function create_material(item){
    let materials = {
        "b2mml:ID": item.id,
        "b2mml:Description": [item.description],
        "b2mml:MaterialID": item.materialID,
        "b2mml:Order": item.order,
        "b2mml:Amount": createAmount(item.amount)
        }
    return materials
}

function create_materials(workspace_items, id, description, materials_type){
    let materials = {
            "b2mml:ID": id, 
            "b2mml:Description":[description],
            "b2mml:MaterialsType":materials_type,
            "b2mml:Material":[]
        }
        //get list of input and output materials
        for(let item of workspace_items){
            if(item.type === "material"){
                if(item.materialType === materials_type){
                    materials["b2mml:Material"].push(
                        create_material(item)
                        );
                }
            }
        }
    return materials
}

function createProcedureChartElement(item){
    let chartElement = {
        "b2mml:ID":item.id,
        "b2mml:Description":[item.description]
    }
    return chartElement;
}

function create_formula(workspace_items, jsplumb_connections){
    let formula = {
        "b2mml:Description":["The formula defines the Inputs, Intermediates and Outputs of the Procedure"],
        "b2mml:ProcessInputs": create_materials(workspace_items, "inputid", "List of Process Inputs", "Input"),
        "b2mml:ProcessOutputs": create_materials(workspace_items, "outputsid", "List of Process Outputs", "Output"),
        "b2mml:ProcessIntermediates": create_materials(workspace_items, "intermediateid", "List of Process Intermediates", "Intermediate"),
        "b2mml:ProcessElementParameter":[]
    }


    return formula;
}
function create_process_element_parameter(item){
    let parameter = {
        "b2mml:ID": item.id,
        "b2mml:Description": [item.description],
        "b2mml:Value": createValueType(item.value)
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
        "b2mml:ConstraintID": item.id,
        "b2mml:Description": [item.description[0]], // put in array as array input is not implemented in editor yet
        //"b2mml:ConstraintType": [item.constraintType],
        "b2mml:LifeCycleState": {},
        "b2mml:Range": createValueType(item.range), //put in array as array input is not implemented in editor yet 
        //"b2mml:ResourceConstraintProperty": [{}] //put it in array as array inputs are not implemented into editor yet. Object not implemented yet 
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
    process_element["b2mml:Materials"].push(create_materials(workspace_items, item.id+"InputMaterials", "Input Materials of Process"+ item.id, "Input"))
    process_element["b2mml:Materials"].push(create_materials(workspace_items, item.id+"IntermediateMaterials", "Intermediate Materials of Process"+ item.id, "Intermediate"))
    process_element["b2mml:Materials"].push(create_materials(workspace_items, item.id+"OutputMaterials", "Output Materials of Process"+ item.id, "Output"))
    
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
            if(child_item.procedureChartElement){
                child_workspace_items.push(...child_item.procedureChartElement)
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
 
    //add proccessChartElements
    workspace_items.forEach(function (child_item) {
        if(child_item.type == "chart_element"){
            process_element["b2mml:ProcedureChartElement"].push(
                //add child itemlist and connections here here to enable makro steps 
                createProcedureChartElement(child_item)
            )
        } 
    });


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


    //function to delete all ["", null, undefined, {}, []] values
    function cleanUp(obj) {
        for (var attrKey in obj) {
            var attrValue = obj[attrKey];
            if (attrValue === null || attrValue === "" || attrValue === undefined) {//delete "", null, undefined
                delete obj[attrKey];
            } else if (Object.prototype.toString.call(attrValue) === "[object Object]") {
                if(Object.keys(attrValue).length === 0){ //delete empty objects
                    delete obj[attrKey]
                }else{
                    cleanUp(attrValue); //if not empty recursivly check children
                    if (Object.keys(attrValue).length === 0) { //check if all children were deleted and object is empty now
                        delete obj[attrKey];
                      }
                }
            } else if (Array.isArray(attrValue)) {
                if(attrValue.length===0){ //delete empty arrays
                    delete obj[attrKey]
                }else{
                    attrValue.forEach(function (arrayValue) { //if not empty go through elements
                        cleanUp(arrayValue);
                    });
                    if(attrValue.length===0){ //check if every element was deleted and list is empty now
                        delete obj[attrKey]
                    }
                }
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
    client.get('/grecipe/validate', {
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