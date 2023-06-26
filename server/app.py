#utils
import json
import os
import mimetypes
#webserver
from flask import Flask, flash, redirect, request, send_from_directory, make_response, url_for
from werkzeug.utils import secure_filename
#ontologies
from owlready2 import *


def add_subclasses(input_object, children_classes_list, super_class_name):
    # initiate input Object
    input_object[super_class_name] = {
        "type": "process_package",
        "name": super_class_name,
        "children":[]
    }
    # generate object from Ontologie 
    for entry in children_classes_list:
        entry_str = str(entry).split(".")[-1]
        input_object[super_class_name]["children"].append({"type": "process", "name":entry_str})

    return input_object

#onto = get_ontology(path).load()



#onto_c4i = get_ontology("https://www.w3id.org/basyx/c4i").load()
#onto_acplt = get_ontology("http://www.acplt.de/Capability").load()   #does not work
onto_acplt = get_ontology("file://d:/git_repos/Masterarbeit_Editor/server/config/IAT-Ontologie/Capability_with_Query.owl").load()

#Init ontologies
ontologies = {"acplt":onto_acplt}


# ontocape does not load properly as it trys to get dependencies from root directory "c:/OntoCAPE/OntoCAPE/..."
# but even actually putting the ontologie there does not work
#onto_cape = get_ontology("file://d:/git_repos/Masterarbeit_Editor/config/Ontocape/OntoCAPE/OntoCAPE.owl").load()

#acplt
#print(list(onto_acplt.classes()))
#general_capability_effecting_list = list(onto_acplt.GeneralCapabilityEffecting.subclasses())
#print(general_capability_effecting_list)
#process_specific_capability_list = list(onto_acplt.ProcessSpecificCapability.subclasses())
#print(process_specific_capability_list)

#input_object = {}
#input_object = add_subclasses(input_object, general_capability_effecting_list, "GeneralCapabilityEffecting")
#input_object = add_subclasses(input_object, process_specific_capability_list, "ProcessSpecificCapability")


# write object to file
#with open('static/input.json', 'w', encoding='utf-8') as f:
#    json.dump(input_object, f, ensure_ascii=False, indent=4)

#ontocape
#print(list(onto_cape.classes()))
#print(list(onto_cape.GeneralCapabilityEffecting.subclasses()))
#print(list(onto_cape.ProcessSpecificCapability.subclasses()))

class CustomFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        variable_start_string='%%',  # Default is '{{', I'm changing this because Vue.js uses '{{' / '}}'
        variable_end_string='%%',
    ))


UPLOAD_FOLDER = './ontologies'
ALLOWED_EXTENSIONS = {'owl'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'

# Main Website
@app.route("/")
def index():
    return app.send_static_file("index.html")

# Make the other static files availible. When index.html is opened from the route above the javascript and css and logo etc can get loaded by the client
@app.route('/<path:filename>')
def static_files(filename):
    response = make_response(send_from_directory(app.static_folder, filename))
    mimetype, _ = mimetypes.guess_type(filename)
    response.headers['Content-Type'] = mimetype
    return response

# Method to load an ontology 
@app.route('/onto',methods = ['POST', 'GET'])
def get_onto():
   #if get return list of ontologies
   if request.method == 'GET':
      response = make_response(list(ontologies.keys()))
      return response
   #if post add new ontology 
   elif request.method == 'POST':
      user = request.args.get('nm')
      response = make_response()
      return response
   #if not post or get give back error
   else:
      response = make_response()
      return response

@app.route('/onto/<onto_name>/classes')
def get_classes(onto_name, methods = ['GET']):
    classes = list(ontologies[onto_name].classes()) #returns a generator therefore we need list()
    classes = [item.name for item in classes]
    response = make_response(classes)
    return response

@app.route('/onto/<onto_name>/<super_class>/subclasses')
def add_ontology(onto_name="acplt", super_class="GeneralCapabilityEffecting"):
    classes_dict = {}
    onto = ontologies[onto_name]
    subclasses_list = list(onto[super_class].subclasses())
    classes_dict = add_subclasses(classes_dict, subclasses_list, super_class)
    processes =  json.dumps(classes_dict, ensure_ascii=False, indent=4)
    response = make_response(processes)
    return response

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        print("upload startet")
        # check if the post request has the file part
        if 'file' not in request.files:
            print("no file given")
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            print("filename is empty string")
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            print("file allowed")
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('download_file', name=filename))
        print("file not allowed")
    make_response("file not allowed or no post request")
    
@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], name)


#debug is for testing to make this production ready read:
# https://zhangtemplar.github.io/flask/
if __name__ == '__main__':
  
  app.run(debug=True, ssl_context='adhoc')