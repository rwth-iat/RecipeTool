import { generate_batchml } from "../components/create_xml/new_export_xml.js"; // Adjust the path as needed
import { expect, test } from "vitest";

test("mount Processes component", async () => {
    let workspace_items = [{
        id: "lmorr3zsv6wxnsippj",
        description: "Draining",
        name: "Draining",
        otherInformation: [{"otherInfoID":"testOtherInfoID","description":["testDescription"],"otherValue":[{"valueString":"test value string","key":"testkey"}]}],
        sourceEndpoint: {},
        targetEndpoint: {},
        amount: {},
        type: "process",
        x: 300,
        y: 400
    }]
    let jsplumb_connections = []
    let generatedXmlString = generate_batchml(workspace_items, jsplumb_connections)
    
    //Define Expected XML
    const expectedXmlString = '<p0:GRecipe xmlns:p0="http://www.mesa.org/xml/B2MML"><p0:ID/><p0:Description/><p0:GRecipeType>General</p0:GRecipeType><p0:Formula><p0:Description>The formula defines the Inputs, Intermediates and Outputs of the Procedure</p0:Description><p0:ProcessInputs><p0:ID>inputid</p0:ID><p0:Description>List of Process Inputs</p0:Description><p0:MaterialsType>Input</p0:MaterialsType></p0:ProcessInputs><p0:ProcessOutputs><p0:ID>outputsid</p0:ID><p0:Description>List of Process Outputs</p0:Description><p0:MaterialsType>Output</p0:MaterialsType></p0:ProcessOutputs><p0:ProcessIntermediates><p0:ID>intermediateid</p0:ID><p0:Description>List of Process Intermediates</p0:Description><p0:MaterialsType>Intermediate</p0:MaterialsType></p0:ProcessIntermediates></p0:Formula><p0:ProcessProcedure><p0:ID>Procedure1</p0:ID><p0:Description>This is the top level ProcessElement</p0:Description><p0:ProcessElementType>Process</p0:ProcessElementType><p0:ProcessElement><p0:ID>lmorr3zsv6wxnsippj</p0:ID><p0:Description>Draining</p0:Description><p0:OtherInformation><p0:OtherInfoID>testOtherInfoID</p0:OtherInfoID><p0:Description>testDescription</p0:Description><p0:OtherValue><p0:ValueString>test value string</p0:ValueString><p0:Key>testkey</p0:Key></p0:OtherValue></p0:OtherInformation></p0:ProcessElement></p0:ProcessProcedure><p0:ResourceConstraint/><p0:OtherInformation/></p0:GRecipe>';

    //Assertion
    expect(generatedXmlString).toBe(expectedXmlString);
 });