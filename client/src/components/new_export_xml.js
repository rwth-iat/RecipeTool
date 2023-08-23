console.log("test")
//var Jsonix = require('jsonix').Jsonix;
import { Jsonix } from 'jsonix-issue-238-fixed';
import { org_mesa_xml_b2mml} from '../../batchml/bindings/org_mesa_xml_b2mml_edited';
//import * as org_mesa_xml_b2mml_Module from '../../batchml/bindings/org_mesa_xml_b2mml.js';

function create_formula(){
    var formula = {
        description:["test"],
        processInputs:{},
        processOutputs:{},
        processIntermediates:{},
        processElementParameter:[]
    }
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



export function export_batchml(workspace_items, connections){
    
    //const gRecipeInstance = new org_mesa_xml_b2mml_Module.GRecipeType();
    // Create a Jsonix context
    const context = new Jsonix.Context([org_mesa_xml_b2mml]);
    //console.log(context)
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
            formula: create_formula(),
            processProcedure: create_process_element_type("Procedure1", "Process", workspace_items, connections),
            resourceConstraint:[{}],
            otherInformation:[{}]
        }
    }

    // Marshal the JavaScript object to XML
    const marshaller = context.createMarshaller();
    const document = marshaller.marshalDocument(gRecipe);
    const xmlString = marshaller.marshalString(gRecipe)

  
    console.log(xmlString)
}

