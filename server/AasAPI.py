from flask import Blueprint, request, make_response
import os
import xml.etree.ElementTree as ET
from Functions import upload_file

AAS_FOLDER = "aasx/"
UPLOAD_FOLDER = './upload/'

def load_aas():
  aas = {}
  for filename in os.listdir(os.path.join(UPLOAD_FOLDER, AAS_FOLDER)):
      if filename.endswith('.aas.xml'):
          # with open(os.path.join(UPLOAD_FOLDER, filename), 'r') as file:
          #    ontologies[filename] = file.read()
          complete_path = os.path.join(UPLOAD_FOLDER, AAS_FOLDER, filename)
          aas[filename] = ET.parse(complete_path)
  return aas

aas_api = Blueprint('aas_api', __name__)

@aas_api.route('/AASX', methods=['POST'])
def upload_aasx():
    """Endpoint to upload a new ontologie to the server.
    ---
    tags:
      - AAS
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
    return upload_file(request, "aasx")

@aas_api.route('/aas/<aas_name>/capabilities')
def get_availible_capabilities(aas_name, methods=['GET']):
    """Endpoint returning the list of capabilities specified in <aas> with given name.
    ---
    tags:
      - AAS
    parameters:
      - name: aas_name
        in: path
        type: string
        required: true
        default: all
    responses:
      200:
        description: A list of the capabilities in the aas.
        examples: [{
                    "idShort": "Stirring",
                    "semanticId": {
                        "keys": {
                        "key": "http://www.acplt.de/Capability#Stirring"
                        }
                    }
                    }]
    """
    # returns a generator therefore we need list()
    aas = load_aas()
    root = aas[aas_name]
    capabilities = []
    #the tag name has a namespace "<aas:capability>"
    #therefore we need to take the namespace definiton from the first lines of the xml
    #xmlns:aas='{http://www.admin-shell.io/aas/2/0}'
    ns='{http://www.admin-shell.io/aas/2/0}' #namespace definition
    
    for capability in root.iter(ns+'capability'):
        capabilities.append({
                            "ID" : capability.find(ns+'idShort').text,
                            "IRI":capability.find(ns+'semanticId').find(ns+'keys').find(ns+'key').text
                            })
    response = make_response(capabilities)
    return response