from flask import Blueprint, request, make_response, flash
import xml.etree.ElementTree as ET
from basyx.aas.compliance_tool import compliance_check_aasx
from basyx.aas.compliance_tool import compliance_check_xml as compliance_tool_xml, \
    compliance_check_json as compliance_tool_json, compliance_check_aasx as compliance_tool_aasx
from basyx.aas.adapter.json import write_aas_json_file
from basyx.aas.adapter.xml import write_aas_xml_file
from basyx.aas.adapter.aasx import AASXReader, DictSupplementaryFileContainer
from basyx.aas.examples.data import create_example, create_example_aas_binding, TEST_PDF_FILE
from basyx.aas.compliance_tool.state_manager import ComplianceToolStateManager, Status
from basyx.aas.model import DictObjectStore
import tempfile
import os

def get_aasx_id(file_content):
  root = ET.fromstring(file_content)
  #the tag name has a namespace "<aas:capability>"
  #therefore we need to take the namespace definiton from the first lines of the xml
  #xmlns:aas='{http://www.admin-shell.io/aas/2/0}'
  ns='{http://www.admin-shell.io/aas/2/0}' #namespace definition
  aasids = []
  for aas in root.iter(ns+'assetAdministrationShell'):
      aasids.append(aas.find(ns+'identification').text)
  return aasids

def get_all_aas_capabilities(file_content):
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
        
def get_all_aasx_capabilities(file_contents):
    with tempfile.NamedTemporaryFile(mode='wb+', delete=False) as temp_file:
        temp_file.write(file_contents)
        temp_file_path = temp_file.name
    objects = DictObjectStore()
    files = DictSupplementaryFileContainer()
    with AASXReader(temp_file_path) as reader:
        meta_data = reader.get_core_properties()
        reader.read_into(objects, files)
        with tempfile.NamedTemporaryFile(mode='wb+', delete=False) as temp_file:
          write_aas_xml_file(temp_file, objects)
          temp_file_path = temp_file.name
          print(temp_file_path)
          file_content = temp_file.read()
        print("###########################################")
        print(file_content)
    capabilities = get_all_aas_capabilities(file_content)
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
  
@aas_api.route('/AAS/capabilities', methods=['POST'])
def get_aas_capabilities():
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
  
@aas_api.route('/AASX/validate', methods=['POST'])
def validate_aasx():
    """Endpoint to validate a AASX.
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
        description: Boolean showing if AASX is valid or not.
        examples:
            rgb: True
    """
    if 'file' not in request.files:
      print("no file given")
      flash('No file part')
      return make_response(request.url, 400)
    file = request.files['file']
    file_content = file.read()
    stateManager = ComplianceToolStateManager()
    
    with tempfile.NamedTemporaryFile(mode='wb+', delete=False) as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name
    try:
        compliance_tool_aasx.check_schema(temp_file_path, stateManager) 
    except Exception as e:
      # Handle the exception here
      print(f"An error occurred: {e}")
      # You can also log the error or take any other appropriate action
      return make_response(str(e), 400)
    finally:
        # Clean up: delete the temporary file
        os.remove(temp_file_path) 
    return make_response("True", 200)
    

 