from app import start_server
import requests
url = "https://127.0.0.1:5000/onto"

# gets called before every test 
def setup_function():
    print('setting up')
#    start_server()


def test_get_ontologies():
    #response = requests.get(url, params=None)
    #assert response.status_code == 200
    #assert response.text == "Capability_with_Query"
    print("placeholer test succeeded")


    
# gets called after every test
def teardown_function():
    print('tearing down')
