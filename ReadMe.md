# RecipeEditor
A graphical web-based editor for the creation and editing of BatchML/B2MML-compliant general- and master recipes in accordance with ANSI/ISA-88. The application offers drag-and-drop workspaces for process, material, and sequence structures, import and export of XML and Workspace JSON files, as well as XSD validation of the generated recipes. Ontologies, Asset Administration Shell (AAS) files, and Module Type Package (MTP) files can be integrated to incorporate semantic process and material classes, capabilities, equipment information, parameters, and value ranges into recipe modeling.

#### Purpose

The repository provides a research-oriented software prototype for modelling recipe structures in the context of modular process automation. Its main purpose is to support the transition from formal and semantically enriched process descriptions towards executable or resource-dependent recipe representations.

The tool is intended to support workflows such as:

* graphical modelling of process and recipe structures,
* creation of general recipes and master recipes according to ISA-88,
* generation and validation of BatchML/B2MML XML files,
* enrichment of recipe elements with semantic capability information,
* import and processing of ontology-based process capabilities,
* use of AAS and MTP files as resource descriptions,

### Graphical Recipe Modelling

* Drag-and-drop modelling of recipe and process elements.
* Visual connection of elements to define process or recipe flow.
* Support for begin/end elements, process elements, material elements, chart elements, and recipe elements.
* Editing of element properties through an interactive property window.
* Workspace navigation with zooming and panning.
* Support for nested or secondary workspaces for macro or subprocess structures.

##### General Recipe Editor

The general recipe editor supports apparatus-neutral recipe modelling. It can be used to describe process requirements independently of a concrete plant configuration.

Typical functionality includes:

* modelling of general recipes,
* semantic annotation of process capabilities,
* ontology upload and capability extraction,
* export of general recipe information to BatchML/B2MML,
* validation of generated XML against BatchML schema definitions.

The general recipe editor is available at:

```text
http://127.0.0.1:5000/
http://127.0.0.1:5000/general-recipe-editor
```
##### Master Recipe Editor

The master recipe editor extends the graphical modelling approach towards plant- or resource-dependent recipe structures.

Typical functionality includes:

* modelling of master recipes,
* configuration of master recipe metadata,
* MTP-file upload
* editing of parameters,
* export of master recipes as BatchML/B2MML XML,
* server-side XSD validation,

The master recipe editor is available at:

```text
http://127.0.0.1:5000/master-recipe-editor
```

### Architecture

The repository is structured as a client-server application.

```text
RecipeEditor/
├── client/   # Vue.js frontend
└── server/   # Python/Flask backend
```

### Getting Started

#### Requirements

Recommended versions:

```text
Python 3.10
Node.js 18.17.1
npm
```
#### Install and Run the Backend

From the repository root:

```bash
cd server
pip install -r requirements.txt
python server.py
```

The backend starts on:

```text
http://127.0.0.1:5000
```

The API documentation is available at:

```text
http://127.0.0.1:5000/apidocs
```

#### Install and Run the Frontend in Development Mode

For frontend development without rebuilding the static files served by Flask:

```bash
cd client
npm install
npm run dev
```

The Vite development server is usually available at:

```text
http://localhost:5173
```

This mode is useful for frontend development because it supports fast rebuilds and browser-based debugging.

#### Build the Frontend for the Flask Server

After frontend changes, the client must be rebuilt so that the Flask backend can serve the updated static files.

```bash
cd client
npm install
npm run build
```

The generated frontend build is copied into the backend static folder and can then be served by the Flask application.

#### Build and Run via Batch Script

On Windows, the repository provides a batch script for rebuilding the frontend and starting the backend:

```bash
./build_run.bat
```

Run this command from the repository root.


### Typical Workflow

#### General Recipe Workflow

1. Start the backend.
2. Open the general recipe editor.
3. Upload or select ontology-based capabilities.
4. Drag process and material elements into the workspace.
5. Connect elements to define the process flow.
6. Edit element properties and semantic annotations.
7. Export the general recipe as BatchML/B2MML.
8. Validate the generated XML.

#### Master Recipe Workflow

1. Start the backend.
2. Open the master recipe editor.
3. Configure the recipe metadata.
4. Optionally use AAS or MTP data for resource-related information.
5. Add recipe elements to the workspace.
6. Connect recipe steps in the intended order.
7. Define conditions, formula parameters, and equipment requirements.
8. Export the master recipe as BatchML/B2MML.
9. Validate the generated XML against the schema.

### Repository Context

This repository is developed at the Chair of Information and Automation Systems, RWTH Aachen University, in the context of research on formal recipe modelling, semantic process descriptions, modular automation, capability-based engineering, and ISA-88/BatchML-based recipe exchange.

### License

Please refer to the repository license file.

### Contact

For questions regarding the research context or further development, please contact the maintainers of the repository.
