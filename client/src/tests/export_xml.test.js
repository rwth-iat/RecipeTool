import { create_process_element_type } from "../components/export_xml.js"; // Adjust the path as needed
import { expect, test } from "vitest";

test("mount Processes component", async () => {
    var xmlDocument = document.implementation.createDocument("", "BatchInformation");
    var input_obj = {
        "Name": "ProcessProcedure",
        "ID": "procedureID", 
        "ProcessElementType": "Process Procedure",
        "ProcessElement": {
            "Name": "ProcessElement",
            "ID": "draining1", 
            "ProcessElementType": "Process Action",
        }
    }
    var generatedXml = create_process_element_type(xmlDocument, "ProcessProcedure", input_obj)
    
    // Convert Generated XML to String
    const serializer = new XMLSerializer();
    const generatedXmlString = serializer.serializeToString(generatedXml);

    //Define Expected XML
    const expectedXmlString = '<ProcessProcedure><ID>procedureID</ID><ProcessElementType>Process Procedure</ProcessElementType><ProcessElement><ID>draining1</ID><ProcessElementType>Process Action</ProcessElementType></ProcessElement></ProcessProcedure>';

    //Assertion
    expect(generatedXmlString).toBe(expectedXmlString);
 });