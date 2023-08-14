# general info
[![Python application](https://github.com/ReggaeUlli/Masterarbeit-code/actions/workflows/python-app.yml/badge.svg)](https://github.com/ReggaeUlli/Masterarbeit-code/actions/workflows/python-app.yml)


# structure
As a complex Ui is needed for the Editor, a Javascript Framework is recommended to handle the complexity.
Vue.js was chosen as it is one of the most used Frameworks and recommended for solo Programming, while other frameworks have benefits in Enterprise setting.

Therefore the Projekt will be build on those two main technologies:
- Python + Flask library for Backend.
- Vue.js for Frontend

This is also displayed in the folder structure:
- "server" is for the Flask app.
- "client" is for the Vue.js Frontend.

# building the project
prerequisits:
- npm must be installed
- to make sure all packages are installed and build the package:
  - `cd client`
  - `npm install`
  - `npm run build`

- For the python server part make sure to use the projects conda environment [todo: put link etc here]:
  - make sure you are in the right folder (server) and run the app.py script
  - `python app.py`

-if all prequisites are already installed simply run:
  - ./build_run.bat
