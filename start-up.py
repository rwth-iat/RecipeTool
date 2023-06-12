from owlready2 import *
from flask import Flask, current_app, render_template
import json

def add_subclasses(input_object, children_classes_list, super_class_name):
    # initiate input Object
    input_object[super_class_name] = {
        "type": "process_package",
        "name": super_class_name,
        "children":{}
    }
    # generate object from Ontologie 
    for entry in children_classes_list:
        entry_str = str(entry).split(".")[-1]
        input_object[super_class_name]["children"][entry_str] = {"type": "process"}

    return input_object


onto_c4i = get_ontology("https://www.w3id.org/basyx/c4i").load()
#onto_acplt = get_ontology("http://www.acplt.de/Capability").load()   #does not work
onto_acplt = get_ontology("file://d:/git_repos/Masterarbeit_Editor/config/IAT-Ontologie/Capability_with_Query.owl").load()

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
with open('static/input.json', 'w', encoding='utf-8') as f:
    json.dump(input_object, f, ensure_ascii=False, indent=4)

#ontocape
#print(list(onto_cape.classes()))
#print(list(onto_cape.GeneralCapabilityEffecting.subclasses()))
#print(list(onto_cape.ProcessSpecificCapability.subclasses()))

app = Flask(__name__)

@app.route('/index/')
def root():
    return render_template('index.html')

#debug is for testing to make this production ready read:
# https://zhangtemplar.github.io/flask/
if __name__ == '__main__':
  app.run(debug=True, ssl_context='adhoc')