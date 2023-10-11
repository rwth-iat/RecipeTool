# webserver
from flask import Flask, send_from_directory, make_response, redirect
from waitress import serve #this is for the production server
from flasgger import Swagger
# utils
import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

from RecipeAPI import recipe_api
from OntologyAPI import ontology_api
from AasAPI import aas_api

ontologies = {}
aas = {}


UPLOAD_FOLDER = './upload/'
ONTO_FOLDER = "ontologies/"
AAS_FOLDER = "aasx/"
RECIPE_FOLDER = "recipes/"

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

    @app.route('/check/capabilities/basic')
    def check_capabilities_basic(filename):
        """Endpoint to serve the static files to the server.
            This is needed in order for the Graphical Editor to work, as index.html links to the css and JS file in static folder.
        ---
        tags:
          - Check Capabilitys
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