from server import create_app
import pytest
import json
import os
from pathlib import Path

# is run before the tests
# creates an instance of the webserver
@pytest.fixture
def app():
    app = create_app()
    print(app.url_map)
    return app

# is run before the tests
# creates a flask test client based on the webserver
@pytest.fixture
def client(app):
    return app.test_client()

def test_editor(client):
    response = client.get('/editor')
    assert response.status_code == 200

    #check if returned webpage is the same as index.html
    with open("static/index.html","r") as html:
        index_html_text = html.read()
    assert response.text == index_html_text

def test_static_files(client):
    #iterate over all static files.
    static_dir = "/static/"
    pathlist = Path(static_dir).glob('**/*')
    for path in pathlist:
        # request the file and check if OK
        path_in_str = str(path)
        response = client.get(path_in_str)
        assert response.status_code == 200

        #compare with actual file content
        with open(path_in_str,"r") as html:
            file_text = html.read()
        assert response.text == file_text

def test_get_onto(client):
    response = client.get('/editor')
    assert response.status_code == 200
    # Add more test assertions as needed

#def test_post_onto(client):
#    response = client.post('/onto')
#    assert response.status_code == 200
#    # Add more test assertions as needed

def test_get_specific_onto(client):
    response = client.get('/onto/Capability_with_Query.owl')
    assert response.status_code == 200
    # Add more test assertions as needed

def test_get_onto_classes(client):
    response = client.get('/onto/Capability_with_Query.owl/classes')
    assert response.status_code == 200
    response_obj = json.loads(response.text)
    wanted_response = ["Absorbing","Combining","Separating","Gas","Liquid","Solid","Acoustic_gas_cleaning","Briquetting","Actuator","Component","Adsorbing","Agglomerating","OperationChangingMaterial","Agitator","Stirring","AnalogValve","Valve","On/OffValve","Atomizing","Dosing","BarrelPump","Pump","Beading","Dividing","Detach","BranchL","ControlledValve","Branching","ProcessSpecificCapability","CapabilityConstraint","CentrifugalPump","Centrifuging","Store","Changing_the_enthalpy","PressureAdjustment","Tempering","Circulation","GeneralCapabilityEffecting","Compacting","Resource","Condenser","HeatExchanger","Cooling","Heater","Condensing","Container","ControlledConatiner","FEA","ControlledHeater","ControlledPump","ControlledReactor","Heating","Cooling_of_gases","Cooling_of_liquids","Cooling_of_solids","Crushing","Crystallising","Cutting","Cycloning","Decanting","Defibering","DensityMeasuring","GeneralCapabilityMeasuring","Density_sorting","DepthConstraint","Desorbing","Dialysing","Dispersion_granulating","Dissolving","Distilling","DosierPump","DosingFlow","DosingVolumen","Draining","Drying","Electric-magnetic_Crushing","ElectricalField","Electrical_gas_cleaning","Electro-osmosis","Electro_sorting","Electrodialysing","Electrophoretising","Emulsifying","Energy","Form","Evaporating","Exsorbing","Extracting","FBranchL","FlowSensor","FPumpL","Filtering","Filtration","Flaking","Floating","FlowConstraint","FlowMeasuring","FlowPumpThing","Sensor","FlowStoping","Foam_braking","Foam_creating","Foaming","ForceMeasuring","ProductObjectMaterial","Formless","Freeze","FrequencyMeasuring","Fusing","Gas_centrifuging","Gas_washing","GeneralCapability","Given_geometric_shape","Grease_adhesion_sorting","Grinding","Heating_of_gases","Heating_of_liquids","Heating_of_solids","HumidityMeasuring","Hydroclassifying","Hydrocycloning","Impact_separating","Impact_sorting","Kneading","LAgitatorL","LevelSensor","LContainerL","LPumpL","LTAgitatorL","TemperatureSensor","LTHeaterL","LengthConstraint","LevelMeasuring","Magnetically_separating","Melting","Milling","Mixing","Mixing_of_Gases","Mixing_of_Liquids","Moistening_of_Gases","PHMeasuring","PHSensor","Picking","Pipeline","PressureConstraint","PressureMeasuring","PressureSensor","Pumping","Quenching_Granulating","Rasp","Rectifying","Refining","Roll_granulating","RotationConstraint","Rubbing","Sedimenting","Segregating","Separation_diffusion","Sieving","Sifting","Sintering","Smoothing","Soaking","Solidifying","Solubility_displacing","SpeedMeasuring","Spraying","Squeezing","Sublimating","Suspending","Swelling","TAgitatorL","TemperatureMeasuring","THeaterL","Tabletting","TemperaturConstraint","Thermal_Shredding","Thermal_sorting","Vaporating","Vaporize","Volatilizing","VolomenConstraint","VolumenPumpThing","WeightMeasuring","Zone_melting","SystemCapability"]
    assert response_obj == wanted_response
    # Add more test assertions as needed

def test_get_onto_subclasses(client):
    response = client.get('/onto/Capability_with_Query.owl/Combining/subclasses')
    assert response.status_code == 200
    response_obj = json.loads(response.text)
    wanted_response = [{"name":"Combining","children":[{"name":"Absorbing","children":[]},{"name":"Adsorbing","children":[]},{"name":"Atomizing","children":[]},{"name":"Dissolving","children":[]},{"name":"Emulsifying","children":[]},{"name":"Foam_creating","children":[]},{"name":"Fusing","children":[]},{"name":"Kneading","children":[]},{"name":"Mixing","children":[]},{"name":"Mixing_of_Gases","children":[]},{"name":"Mixing_of_Liquids","children":[]},{"name":"Moistening_of_Gases","children":[]},{"name":"Rubbing","children":[]},{"name":"Smoothing","children":[]},{"name":"Soaking","children":[]},{"name":"Spraying","children":[]},{"name":"Suspending","children":[]},{"name":"Swelling","children":[]},{"name":"Volatilizing","children":[]}]}]
    assert response_obj == wanted_response

# Add more test assertions as needed