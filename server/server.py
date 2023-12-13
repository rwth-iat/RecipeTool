# webserver
from flask import Flask, send_from_directory, make_response, redirect, request, flash
from waitress import serve #this is for the production server
from flasgger import Swagger
from zipfile import ZipFile

# utils
import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

from RecipeAPI import recipe_api, get_all_recipe_capabilities
from OntologyAPI import ontology_api
from AasAPI import aas_api, get_all_aasx_capabilities, get_all_aas_capabilities, get_aasx_id

ontologies = {}
aas = {}


UPLOAD_FOLDER = './upload/'
ONTO_FOLDER = "ontologies/"
AAS_FOLDER = "aasx/"
RECIPE_FOLDER = "recipes/"

def extract_zip(input_zip):
    input_zip=ZipFile(input_zip)
    return {name: input_zip.read(name) for name in input_zip.namelist()}

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

    '''
    @app.route('/CapabilityMatching/AAS/basic', methods=['POST'])
    def check_capabilities_basic():
        """Endpoint to check if all needed capabilities of a recipe can be realized by a given AAS.
        ---
        tags:
          - Capability Matching
        parameters:
          - name: aas
            in: formData
            type: file
            required: true
          - name: recipe
            in: formData
            type: file
            required: true
        responses:
          200:
            description: The requested File
            examples:
              rgb: ['red', 'green', 'blue']
        """
        if 'aasx' not in request.files:
          print("no file given")
          flash('No file part')
          return make_response(request.url, 400)
        aasx = request.files['aasx']
        aasx_content = aasx.read()
        aasx_capabilities = get_all_aasx_capabilities(aasx_content) 


        if 'recipe' not in request.files:
          print("no file given")
          flash('No file part')
          return make_response(request.url, 400)
        recipe = request.files['recipe']
        recipe_content = recipe.read()
        recipe_capabilities = get_all_recipe_capabilities(recipe_content)
        
        # Extract unique IDs from list A and list B
        unique_aasx_capabilities = set(item['IRI'] for item in aasx_capabilities)
        unique_recipe_capabilities = set(item['IRI'] for item in recipe_capabilities)

        print(unique_recipe_capabilities)
        print(unique_aasx_capabilities)
        
        # Check if all IDs in recipe are in aasx
        if unique_recipe_capabilities.issubset(unique_aasx_capabilities):
            string = "Every Capability IRI that occurs in Recipe is also in AASX (positive case)."
            print(string)
            return make_response(string, 200)
        else:
            string = "There are Capability IRIS in Recipe  that are not in AASX (negative case)." 
            print(string)        
            return make_response(string + str(unique_recipe_capabilities.difference(unique_aasx_capabilities)), 400)
    '''
    
    @app.route('/CapabilityMatching/AAS', methods=['POST'])
    def check_capabilities_complex():
        """Endpoint to match Capabilities of a zip file with ".xml" AAS files and a general Recipe.
        ---
        tags:
          - Capability Matching
        parameters:
          - name: aas
            in: formData
            type: file
            required: true
            description: aas or zip file of aas files
          - name: recipe
            in: formData
            type: file
            required: true
        responses:
          200:
            description: The requested File
            examples:
              rgb: ['red', 'green', 'blue']
        """
        found_capabilities = []
        
        if 'recipe' not in request.files:
          print("no file given")
          flash('No file part')
          return make_response(request.url, 400)
        recipe = request.files['recipe']
        recipe_content = recipe.read()
        recipe_capabilities = get_all_recipe_capabilities(recipe_content)
        unique_recipe_capabilities = set(item['IRI'] for item in recipe_capabilities)
        
        if 'aas' not in request.files:
          print("no file given")
          flash('No file part')
          return make_response(request.url, 400)
        aasx_zip = request.files['aas']
        aasx_files = extract_zip(aasx_zip)
        for element in unique_recipe_capabilities:
          for filename in aasx_files:
            aasx = aasx_files[filename] 
            aasx_capabilities = get_all_aas_capabilities(aasx)
            unique_aasx_capabilities = set(item['IRI'] for item in aasx_capabilities)
            if element in unique_aasx_capabilities:
              print("found capability: " + element)
              aasxids = get_aasx_id(aasx)
              found_capabilities.append("capability: "+element+" can be realized by aas: " + str(aasxids)) 
            else:
              print("did not find capability"+ element)

        # Extract unique IDs from list A and list B
        #unique_aasx_capabilities = set(item['IRI'] for item in aasx_capabilities)
        #unique_recipe_capabilities = set(item['IRI'] for item in recipe_capabilities)
        
        # Check if all IDs in recipe are in aasx
        if len(found_capabilities)>0:
            string=""
            for capability in found_capabilities:
              string = string + capability + "\r\n"
            print(string)
            return make_response(string, 200)
        else:
            string = "There are no Capability IRIS in Recipe that can be realized by an given AAS." 
            print(string)        
            return make_response(string, 200)
          
    @app.route('/CapabilityMatching/AASX', methods=['POST'])
    def capability_Matching_AASX():
        """Endpoint to Match Capabilities of an AASX and a General Recipe.
        ---
        tags:
          - Capability Matching
        parameters:
          - name: aasx
            in: formData
            type: file
            required: true
            description: aas or zip file of aas files
          - name: recipe
            in: formData
            type: file
            required: true
        responses:
          200:
            description: The requested File
            examples:
              rgb: ['red', 'green', 'blue']
        """
        found_capabilities = []
        
        if 'recipe' not in request.files:
          print("no file given")
          flash('No file part')
          return make_response(request.url, 400)
        recipe = request.files['recipe']
        recipe_content = recipe.read()
        recipe_capabilities = get_all_recipe_capabilities(recipe_content)
        unique_recipe_capabilities = set(item['IRI'] for item in recipe_capabilities)
        
        if 'aasx' not in request.files:
          print("no file given")
          flash('No file part')
          return make_response(request.url, 400)
        aasx_zip = request.files['aasx']
        aasx_files = extract_zip(aasx_zip)
        for element in unique_recipe_capabilities:
          for filename in aasx_files:
            aasx = aasx_files[filename] 
            aasx_capabilities = get_all_aas_capabilities(aasx)
            unique_aasx_capabilities = set(item['IRI'] for item in aasx_capabilities)
            if element in unique_aasx_capabilities:
              print("found capability: " + element)
              aasxids = get_aasx_id(aasx)
              found_capabilities.append("capability: "+element+" can be realized by aas: " + str(aasxids)) 
            else:
              print("did not find capability"+ element)

        # Extract unique IDs from list A and list B
        #unique_aasx_capabilities = set(item['IRI'] for item in aasx_capabilities)
        #unique_recipe_capabilities = set(item['IRI'] for item in recipe_capabilities)
        
        # Check if all IDs in recipe are in aasx
        if len(found_capabilities)>0:
            string=""
            for capability in found_capabilities:
              string = string + capability + "\r\n"
            print(string)
            return make_response(string, 200)
        else:
            string = "There are no Capability IRIS in Recipe that can be realized by an given AAS." 
            print(string)        
            return make_response(string, 200)

    app.register_blueprint(ontology_api)
    app.register_blueprint(recipe_api)
    app.register_blueprint(aas_api)
    return app


# debug is for testing to make this production ready read:
# https://zhangtemplar.github.io/flask/
if __name__ == '__main__':
    app = create_app()
    swagger = Swagger(app)
    #serve(app, host='0.0.0.0', port=8080) #this starts the production server
    app.run(debug=True) #this starts the development server