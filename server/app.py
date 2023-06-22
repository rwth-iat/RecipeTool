from flask import Flask, current_app, render_template, request, send_from_directory, make_response
from flask_vite import Vite
from owlready2 import *
import json
import mimetypes


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

app = Flask(__name__)

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

#debug is for testing to make this production ready read:
# https://zhangtemplar.github.io/flask/
if __name__ == '__main__':
  app.run(debug=True, ssl_context='adhoc')