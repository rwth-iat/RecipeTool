from owlready2 import *
import flask
import json

onto_c4i = get_ontology("https://www.w3id.org/basyx/c4i").load()
#onto_acplt = get_ontology("http://www.acplt.de/Capability").load()   #does not work
onto_acplt = get_ontology("file://d:/git_repos/Masterarbeit_Editor/config/IAT-Ontologie/Capability_with_Query.owl").load()

# ontocape does not load properly as it trys to get dependencies from root directory "c:/OntoCAPE/OntoCAPE/..."
# but even actually putting the ontologie there does not work
#onto_cape = get_ontology("file://d:/git_repos/Masterarbeit_Editor/config/Ontocape/OntoCAPE/OntoCAPE.owl").load()

#acplt
#print(list(onto_acplt.classes()))
general_capability_effecting_list = list(onto_acplt.GeneralCapabilityEffecting.subclasses())
print(general_capability_effecting_list)
process_specific_capability_list = list(onto_acplt.ProcessSpecificCapability.subclasses())
print(process_specific_capability_list)

# initiate input Object
name = "acplt"
input_object = {
    name:{
        "type": "process_package",
        "name": name,
        "children":{}
    }
}

# generate object from Ontologie 
for entry in general_capability_effecting_list:
    entry_str = str(entry).split(".")[-1]
    input_object[name]["children"][entry_str] = {"type": "process"}

print(input_object)

# write object to file
with open('config/input.json', 'w', encoding='utf-8') as f:
    json.dump(input_object, f, ensure_ascii=False, indent=4)

#ontocape
#print(list(onto_cape.classes()))
#print(list(onto_cape.GeneralCapabilityEffecting.subclasses()))
#print(list(onto_cape.ProcessSpecificCapability.subclasses()))