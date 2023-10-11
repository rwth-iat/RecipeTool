from flask import Blueprint, request, make_response
import os
import xml.etree.ElementTree as ET
from Functions import upload_file
from lxml import etree

RECIPE_FOLDER = "recipes/"
UPLOAD_FOLDER = './upload/'

recipe_api = Blueprint('recipe_api', __name__)

def validate(xml_string: str, xsd_path: str) -> bool:

    xmlschema_doc = etree.parse(xsd_path)
    xmlschema = etree.XMLSchema(xmlschema_doc)

    xml_doc = etree.fromstring(xml_string.encode('utf-8'))
    result = xmlschema.validate(xml_doc)
    error = xmlschema.assertValid(xml_doc) 

    return result, error

def load_recipes():
  recipes = {}
  for filename in os.listdir(os.path.join(UPLOAD_FOLDER, RECIPE_FOLDER)):
      if filename.endswith('.xml'):
          # with open(os.path.join(UPLOAD_FOLDER, filename), 'r') as file:
          #    ontologies[filename] = file.read()
          complete_path = os.path.join(UPLOAD_FOLDER, RECIPE_FOLDER, filename)
          recipes[filename] = ET.parse(complete_path)
  return recipes



@recipe_api.route('/recipe', methods=['POST'])
def upload_recipe():
    """Endpoint to upload a new recipe to the server.
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
    return upload_file(request, "recipes")
    
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

@recipe_api.route('/recipes/<recipe_name>/capabilities')
def get_required_capabilities(recipe_name, methods=['GET']):
    """Endpoint returning the list of capabilities present in given recipe.
    ---
    tags:
      - Recipes
    parameters:
      - name: recipe_name
        in: path
        type: string
        required: true
        default: all
    responses:
      200:
        description: A list of the capabilities in the recipe.
        examples: [{
                    "ID": "Stirring",
                    "IRI": "http://www.acplt.de/Capability#Stirring"
                    }]
    """
    # returns a generator therefore we need list()
    recipes = load_recipes()
    root = recipes[recipe_name]
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
    response = make_response(capabilities)
    return response