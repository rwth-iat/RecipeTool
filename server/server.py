# webserver
from flask import Flask, flash, request, send_from_directory, make_response, redirect
from waitress import serve #this is for the production server
# from flask_restful import Api, Resource

from flasgger import Swagger
# ontologies
import owlready2
# utils
import json
import os
import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
# xml validation
from lxml import etree
import xml.etree.ElementTree as ET
from io import StringIO

from RecipeAPI import recipe_api
from Functions import upload_file

ontologies = {}
aas = {}


UPLOAD_FOLDER = './upload/'
ONTO_FOLDER = "ontologies/"
AAS_FOLDER = "aasx/"
RECIPE_FOLDER = "recipes/"

def recursivly_add_subclasses(super_class):
    output_obj = {
                "name": str(super_class).split(".")[-1],
                "otherInformation":[{
                            "otherInfoID":"OntologyIRI",
                            "description":["Iri referencing the Ontology Class definition"],
                            "otherValue":[{
                                "valueString": super_class.iri,
                                "dataType":"Text",
                                "unitOfMeasure":"url",
                                "key":str(super_class)
                            }]
                        }],
                "children": []
            }
    if super_class is not None:
        subclasses_list = list(super_class.subclasses())
        if subclasses_list != []:
            for subclass in subclasses_list:
                child = recursivly_add_subclasses(subclass)
                output_obj["children"].append(child)
    return output_obj


def add_subclasses(input_object, children_classes_list, super_class_name):
    # initiate input Object
    input_object[super_class_name] = {
        "name": super_class_name,
        "children": []
    }
    # generate object from Ontologie 
    for entry in children_classes_list:
        entry_str = str(entry).split(".")[-1]
        input_object[super_class_name]["children"].append({
            "type": "process",
            "name": entry_str
        })

    return input_object


def load_ontologies():
    ontologies = {}
    for filename in os.listdir(os.path.join(UPLOAD_FOLDER, ONTO_FOLDER)):
        if filename.endswith('.owl'):
            # with open(os.path.join(UPLOAD_FOLDER, filename), 'r') as file:
            #    ontologies[filename] = file.read()
            complete_path = os.path.join(UPLOAD_FOLDER, ONTO_FOLDER, filename)
            ontologies[filename] = owlready2.get_ontology(complete_path).load()
    return ontologies
  
def load_aas():
  aas = {}
  for filename in os.listdir(os.path.join(UPLOAD_FOLDER, AAS_FOLDER)):
      if filename.endswith('.aas.xml'):
          # with open(os.path.join(UPLOAD_FOLDER, filename), 'r') as file:
          #    ontologies[filename] = file.read()
          complete_path = os.path.join(UPLOAD_FOLDER, AAS_FOLDER, filename)
          aas[filename] = ET.parse(complete_path)
  return aas


def create_app():
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.secret_key = 'super secret key'
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SWAGGER'] = {
        'uiversion': 3,
        "specs_route": "/apidocs/",
        'title': 'General Recipe Editor',
        "description": "API for providing the general recipe editor, ontology management and ontology operations",
        "version": "0.0.1",
        "contact": {
            "name": "Sebastian Ulrich",
            "email": "sebastian.ulrich@rwth-aachen.de"
        }
    }

    @app.route('/')
    def hello():
        """Endpoint to also redirect only the ip+port to the Graphical Editor.
        ---
        tags:
          - General Recipe Editor
        responses:
          302:
            description: redirects to /editor.
            examples:
              rgb: ['red', 'green', 'blue']
        """
        return redirect("/editor", code=302)
      
    # Main Website
    @app.route("/editor")
    def editor():
        """Endpoint to the Graphical Editor for General Recipes.
        ---
        tags:
          - General Recipe Editor
        responses:
          200:
            description: The html file of the Graphical Editor UI.
            examples:
              rgb: ['red', 'green', 'blue']
        """
        return app.send_static_file("index.html")

    # Make the other static files availible.
    # When index.html is opened from the "editor endpoint" the javascript and css and logo etc can get loaded by the client
    @app.route('/<path:filename>')
    def static_files(filename):
        """Endpoint to serve the static files to the server.
            This is needed in order for the Graphical Editor to work, as index.html links to the css and JS file in static folder.
        ---
        tags:
          - General Recipe Editor
        parameters:
          - name: filename
            in: path
            type: string
            required: true
            default: /assets/index-4ed49a4e.css
        responses:
          200:
            description: The requested File
            examples:
              rgb: ['red', 'green', 'blue']
        """
        response = make_response(send_from_directory(app.static_folder, filename))
        mimetype, _ = mimetypes.guess_type(filename)
        response.headers['Content-Type'] = mimetype
        return response

    @app.route('/onto', methods=['POST'])
    def upload_onto():
        """Endpoint to upload a new ontologie to the server.
        ---
        tags:
          - Ontologies
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
        upload_file(request, "ontologies")
        

    # Method to load an ontology
    @app.route('/onto', methods=['GET'])
    def get_onto():
        """Endpoint returning the list of Ontology names currently present at the server.
        ---
        tags:
          - Ontologies
        responses:
          200:
            description: A list of the currently available Ontologies
            examples:
              rgb: ['Ontocap', 'acplt']
        """
        # if get return list of ontologies
        ontologies = load_ontologies()
        response = make_response(list(ontologies.keys()))
        return response

    @app.route('/onto/<path:filename>')
    def download_onto(filename):
        """Endpoint to download an ontologie from the server.
        ---
        tags:
          - Ontologies
        parameters:
          - name: filename
            in: path
            type: string
            required: true
            default: c4i.owl
        responses:
          200:
            description: 
            examples:
              rgb: ['red', 'green', 'blue']
        """
        response = make_response(send_from_directory(os.path.join(app.config["UPLOAD_FOLDER"], ONTO_FOLDER), filename))
        mimetype, _ = mimetypes.guess_type(filename)
        response.headers['Content-Type'] = mimetype
        return response

    @app.route('/onto/<onto_name>/classes')
    def get_classes(onto_name, methods=['GET']):
        """Endpoint returning the list of classes present at the Ontology specified in <onto_name>.
        ---
        tags:
          - Ontologies
        parameters:
          - name: onto_name
            in: path
            type: string
            required: true
            default: all
          - name: file
            in: path
            type: file
            required: true
            default: all
        responses:
          200:
            description: A list of the classes in given Ontology.
        """
        # returns a generator therefore we need list()
        classes = list(ontologies[onto_name].classes())
        classes = [item.name for item in classes]
        response = make_response(classes)
        return response

    @app.route('/onto/<onto_name>/<super_class>/subclasses')
    def get_subclasses(onto_name="acplt", super_class="GeneralCapabilityEffecting"):
        """Endpoint to get all subclasses of a class in the given ontology.
        ---
        tags:
          - Ontologies
        parameters:
          - name: onto_name
            in: path
            type: string
            required: true
            default: acplt
          - name: super_class
            in: path
            type: string
            required: true
            default: GeneralCapabilityEffecting
        responses:
          200:
            description: A list Subclasses and their respective subclasses
            examples:
              rgb: [{
                      "name": "GeneralCapabilityEffecting",
                      "type":"process",
                      "children":[
                          {
                            "name": "Draining",
                            "type":"process",
                            "children":[]
                          },
                          {
                            "type": "process",
                            "name": "Pumping"
                          }
                      ]
                    }]
        """
        classes_obj = {}
        onto = ontologies[onto_name]
        # subclasses_list = list(onto[super_class].subclasses())
        super_class_obj = onto[super_class]
        classes_obj = recursivly_add_subclasses(super_class_obj)
        classes_list = [classes_obj]
        # classes_dict = add_subclasses(classes_dict, subclasses_list, super_class)
        processes = json.dumps(classes_list, ensure_ascii=False, indent=4)
        response = make_response(processes)
        return response
        
    @app.route('/AASX', methods=['POST'])
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

    @app.route('/aas/<aas_name>/capabilities')
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
    
    app.register_blueprint(recipe_api)
    
    #on initializing app we load the ontologies ans aas present at the server
    ontologies = load_ontologies()
    aas = load_aas()
    #ontologies = {}  #uncomment this is for offline development
    return app


# debug is for testing to make this production ready read:
# https://zhangtemplar.github.io/flask/
if __name__ == '__main__':
    app = create_app()
    swagger = Swagger(app)
    #serve(app, host='0.0.0.0', port=8080) #this starts the production server
    app.run(debug=True) #this starts the development server