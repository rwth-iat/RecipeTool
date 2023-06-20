from flask import Flask, current_app, render_template, send_from_directory, make_response
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

def add_ontology(input_obj={}, path="https://www.w3id.org/basyx/c4i", super_class="GeneralCapabilityEffecting"):
    onto_c4i = get_ontology(path).load()
    subclasses_list = list(onto_acplt[super_class].subclasses())
    input_object = add_subclasses(input_object, subclasses_list, super_class)
    return input_obj

onto_c4i = get_ontology("https://www.w3id.org/basyx/c4i").load()
#onto_acplt = get_ontology("http://www.acplt.de/Capability").load()   #does not work
onto_acplt = get_ontology("file://d:/git_repos/Masterarbeit_Editor/server/config/IAT-Ontologie/Capability_with_Query.owl").load()

# ontocape does not load properly as it trys to get dependencies from root directory "c:/OntoCAPE/OntoCAPE/..."
# but even actually putting the ontologie there does not work
#onto_cape = get_ontology("file://d:/git_repos/Masterarbeit_Editor/config/Ontocape/OntoCAPE/OntoCAPE.owl").load()

#acplt
#print(list(onto_acplt.classes()))
general_capability_effecting_list = list(onto_acplt.GeneralCapabilityEffecting.subclasses())
#print(general_capability_effecting_list)
process_specific_capability_list = list(onto_acplt.ProcessSpecificCapability.subclasses())
#print(process_specific_capability_list)

input_object = {}
input_object = add_subclasses(input_object, general_capability_effecting_list, "GeneralCapabilityEffecting")
input_object = add_subclasses(input_object, process_specific_capability_list, "ProcessSpecificCapability")


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

@app.route('/<path:filename>')
def static_files(filename):
    response = make_response(send_from_directory(app.static_folder, filename))
    mimetype, _ = mimetypes.guess_type(filename)
    response.headers['Content-Type'] = mimetype
    return response

@app.route("/")
def index():
    return app.send_static_file("index.html")

#debug is for testing to make this production ready read:
# https://zhangtemplar.github.io/flask/
if __name__ == '__main__':
  app.run(debug=True, ssl_context='adhoc')