from flask import Blueprint, request, make_response, flash
import os
import xml.etree.ElementTree as ET
from lxml import etree

recipe_api = Blueprint('recipe_api', __name__)

def validate(xml_string: str, xsd_path: str) -> bool:

    xmlschema_doc = etree.parse(xsd_path)
    xmlschema = etree.XMLSchema(xmlschema_doc)

    xml_doc = etree.fromstring(xml_string.encode('utf-8'))
    result = xmlschema.validate(xml_doc)
    error = xmlschema.assertValid(xml_doc) 

    return result, error

def get_all_recipe_capabilities(file_content):
  root = ET.fromstring(file_content)
  capabilities = []
  #the tag name has a namespace "<aas:capability>"
  #therefore we need to take the namespace definiton from the first lines of the xml
  #xmlns:aas='{http://www.admin-shell.io/aas/2/0}'
  ns='{http://www.mesa.org/xml/B2MML}' #namespace definition
  
  for processElement in root.iter(ns+'ProcessElement'):
      otherInfos = processElement.findall(ns+'OtherInformation') 
      if otherInfos is None or []:
          continue
      for otherInfo in otherInfos:
          otherInfoId = otherInfo.find(ns+'OtherInfoID')
          if otherInfoId.text == "OntologyIRI":
              capabilities.append({
                              "ID": processElement.find(ns+'ID').text,                   
                              "IRI":otherInfo.find(ns+'OtherValue').find(ns+'ValueString').text
                          })
  return capabilities

@recipe_api.route('/validate')
def validate_batchml():
    """Endpoint to validate a xml string against BatchML xsd schema.
    ---
    tags:
      - Recipes
    parameters:
      - name: xml_string
        in: query
        type: string
        required: true
        default: ""
    responses:
      200:
        description: Given String is valid.
        400:
        description: Given String is not valid.
    """
    args = request.args
    xml_string = args.get("xml_string", type=str)
    print(xml_string)

    valid, error = validate(xml_string, "batchml_schemas/schemas/BatchML-GeneralRecipe.xsd")   
    if valid:
        print('Valid! :)')
        response = make_response("valid!", 200)
        return response
    else:
        print('Not valid! :(')
        response = make_response(error, 400)
        return response

@recipe_api.route('/recipes/capabilities', methods=['POST']) 
def get_recipe_capabilities():
    """Endpoint to get capabilitys form a server.
    ---
    tags:
      - Recipes 
    parameters:
      - name: file
        in: formData
        type: file
        required: true
    responses:
      200:
        description: An ackknowledgement that the upload worked.
        examples:
            rgb: ['red', 'green', 'blue']
    """
    # check if the post request has the file part
    if 'file' not in request.files:
      print("no file given")
      flash('No file part')
      return make_response(request.url, 400)
    file = request.files['file']
    file_content = file.read()
    capabilities = get_all_recipe_capabilities(file_content)
    response = make_response(capabilities)
    return response