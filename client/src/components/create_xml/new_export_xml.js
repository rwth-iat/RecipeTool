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

function create_material(id){
    var materials = {
        id: id,
        description: [],
        materialID: "",
        order: "",
        amount: {}
        }
    return materials
}

function create_materials(id, materials_type){
    var materials = {
            id: id, 
            description:[],
            materialsType:materials_type,
            material:[]
        }
    return materials
}

function create_formula(workspace_items, jsplumb_connections){
    var formula = {
        description:[],
        processInputs:{},
        processOutputs:{},
        processIntermediates:{},
        processElementParameter:[]
    }

    //get list of input and output materials
    const [input_materials, output_materials] = list_source_target(jsplumb_connections)
    
    //add input materials and intermediates
    formula.processInputs = create_materials("inputid", "Input")
    formula.processIntermediates = create_materials("intermediateid", "Intermediate")
    input_materials.forEach(function (item) {
        if(item.type == "material"){
            //check if material is also output
            if(!output_materials.includes(item)){ 
                formula.processInputs.material.push(
                    create_material(item.id, "Input")
                )
            }
            //if also output material than add to intermediate
            else{
                formula.processIntermediates.material.push(
                    create_material(item.id, "Intermediate")
                )
            }
        }
    });

    //add output materials
    formula.processOutputs = create_materials("outputsid", "Output")
    output_materials.forEach(function (item) {
        if(item.type == "material"){ 
            //check if material is only output
            if(!input_materials.includes(item)){ 
                formula.processOutputs.material.push(
                    create_material(item.id, "Output")
                )
            }
            //here we dont add the intermediates, as they were already added with the process inputs
        }
    });
    return formula
}

function create_process_element_type(id, process_element_type, workspace_items, jsplumb_connections){
    var process_element = {
        id: id,
        description: [],
        processElementType: process_element_type,
        lifeCycleState:{},
        sequenceOrder: {},
        sequencePath: {},
        materials: [],
        directedLink: [],
        procedureChartElement: [],
        processElement: [],
        processElementParameter: [],
        resourceConstraint: [],
        otherInformation: []
    }

    //add materials
    workspace_items.forEach(function (item) {
        if(item.type == "material"){  
            process_element.materials.push(
            {
                id: item.id, 
                materialsType: "testMaterialstype"
            }
            )
        }; 
        });
    
    //add directed links
    for (var connectionId in jsplumb_connections) {
        var connection = jsplumb_connections[connectionId]
        process_element.directedLink.push({
            id: connectionId,
            description: [],
            fromID: connection.sourceId,
            toID: connection.targetId
        })
    }

    //add Process Elements
    workspace_items.forEach(function (item) {
        if(item.type == "process"){
            process_element.processElement.push(
                //add child itemlist and connections here here to enable makro steps 
                create_process_element_type(item.id, "Process Action", [], [])
            )
        }; 
    });
    return process_element
}



export function generate_batchml(workspace_items, jsplumb_connections){
    // Create a Jsonix context
    const context = new Jsonix.Context([org_mesa_xml_b2mml]);

    // Create a JavaScript object representing the XML structure
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
            gRecipeType:{},
            lifeCycleState:{},
            header:{},
            formula: create_formula(workspace_items, jsplumb_connections),
            processProcedure: create_process_element_type("Procedure1", "Process", workspace_items, jsplumb_connections),
            resourceConstraint:[{}],
            otherInformation:[{}]
        }
    }

    // Marshal the JavaScript object to XML
    const marshaller = context.createMarshaller();
    const document = marshaller.marshalDocument(gRecipe);
    const xmlString = marshaller.marshalString(gRecipe);
    return xmlString
}