# general info
[![Python application](https://github.com/ReggaeUlli/Masterarbeit-code/actions/workflows/python-app.yml/badge.svg)](https://github.com/ReggaeUlli/Masterarbeit-code/actions/workflows/python-app.yml)

[![Node.js CI](https://github.com/ReggaeUlli/Masterarbeit-code/actions/workflows/node.js.yml/badge.svg)](https://github.com/ReggaeUlli/Masterarbeit-code/actions/workflows/node.js.yml)

# Running the Server
To run the server Python (3.10 at best) needs to be installed.
The following lines make sure you are in the "server" subfolder, install needed python packages using pip and runs the app:

  ```
  cd server
  pip install -r requirements.txt
  python app.py
  ```

After that the server is running under:
- "https://127.0.0.1:5000/apidocs" for the documentation
- "https://127.0.0.1:5000/editor" for the GUI.

# Functionality
## already implemented
- [X] upload ontologies
- [X] load ontology classes as processes
- [X] drag & drop processes and materials into workspace
- [X] move processes and materials in workspace
- [X] connect elements via drag and drop
- [X] double click on element to edit properties
- [X] zoom in and out via zoom buttons
- [X] panning of the workspace (moving horizontally and vertically)
- [X] generate simple BatchML (needs to be extended)
- [X] validate BatchML
- [X] automated testing pipeline with every project push (tests need to be extended)
 
## under development
- [ ] delete elements
- [ ] change element styles to oficial Chart elements
- [ ] enable creation of macro Steps
- [ ] open macro steps in new workspace 
- [ ] enable macro processParameters (only simple ones possible yet)
- [ ] enable possibillity to save current workspace
- [ ] add Ressource Constraints
- [ ] multiple workspace tabs (one for main process, others for opened subprocesses)
- [ ] extend generated BatchML
- [ ] Capability Matching

# Structure
As a complex Ui is needed for the Editor, a Javascript Framework is recommended to handle the complexity.
Vue.js was chosen as it is one of the most used Frameworks and recommended for solo Programming, while other frameworks have benefits in Enterprise setting.

Therefore the Projekt will be build on those two main technologies:
- Python + Flask library for Backend.
- Vue.js for Frontend

This is also displayed in the folder structure:
- "server" is for the Flask app.
- "client" is for the Vue.js Frontend.

# Building the project
After changing the client code, a new Build is necessary for the changes to effect in the server. All steps necessary to Build and start the project are combined in one Batch File. Make sure you are in the root folder of the project and run:
  - `./build_run.bat`

The commands in the build file are explained in the following and can also be run one by one manualy:
- To build the Client part:
  - npm must be installed
  - change directory to clinet folder, make sure all packages are installed and build the package:
    ```
    cd client
    npm install
    npm run build
    ```

- Building the Client part automatically puts the new Client-Files into the servers static folder. Therefore by starting the Python server the new client is served.
  - make sure you are in the right folder (server) and run the app.py script:
    ```
    cd server
    pip install -r requirements.txt
    python app.py
    ```

# Notes for developers
- After Making changes to the Client code, the project needs to be rebuild in order for the changes to arrive in the python server. Therefore after Changes you at least need to run `npm build` in the client folder and afterwards restart the python server. Therefore after changes you can simply run the batch file which will rebuild and start the server for you.
- As the build takes quite a bit of time, when simply developing the client code which does not need the functionality of the python server api, running `npm run dev` in the client folder. This runs a development server at "http://localhost:5173". This starts up much faster and allows for the browser integrated debuggers to work. Also every change in code is directly used in the browser after saving the file with ctrl+s (hotfix)

# Troubleshooting while installing
If you run into problems trying to install/build the project you may look into the github acitons. As the automated tests run successfully, installing the same environment as them should definetly also work. So try to use the same Pyhton/nodejs version and install the dependencies the same way. 


