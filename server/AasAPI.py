from flask import Blueprint, request, make_response, flash
import xml.etree.ElementTree as ET

def get_all_aasx_capabilities(file_content):
  root = ET.fromstring(file_content)
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
  return capabilities
        
aas_api = Blueprint('aas_api', __name__)

@aas_api.route('/AASX/capabilities', methods=['POST'])
def get_aasx_capabilities():
    """Endpoint to get availible Capabilities from a AASX.
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
        # check if the post request has the file part
    if 'file' not in request.files:
      print("no file given")
      flash('No file part')
      return make_response(request.url, 400)
    file = request.files['file']
    file_content = file.read()
    capabilities = get_all_aasx_capabilities(file_content)
    return capabilities

 