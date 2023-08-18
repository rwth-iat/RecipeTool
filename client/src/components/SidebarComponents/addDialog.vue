<script setup>
    import {ref, toRefs, reactive} from 'vue'
    import axios from 'axios'

    //we define a prop elementtype so that we can use this component for materials and Processes 
    const props = defineProps({
        element_type: String,
    });
    const { element_type } = toRefs(props);

    //we define two emit functions to start events in the parent object (sidebar)
    //      close - to close it. It is not possible from inside this component
    //      add   - to add the elements of an ontology into the sidebar
    const emit = defineEmits(['close', 'add'])

    //for the dropdown menus we need some reative variables which get dynamically populated
    const current_ontology = ref('')
    const addOption = ref('')
    const current_super_class = ref('')
	const serverProcessOntologies = ref([""])
	const onto_classes = ref([])
    const current_Elements = ref({})
    const current_file = ref({})

	const client = axios.create({
    	//baseURL: process.env.VUE_APP_BASE_URL
		baseURL: ''
	});

    //get all names/ids of the ontologies present at the server
    function readServerOntologies(){
		client.get('/onto')
			.then(response => {
    			// handle success
    			console.log("read server ontologies successful")
				serverProcessOntologies.value = response.data
			})
  			.catch(error => {
    			// handle error
                console.log("error trying to read server ontologies")
    			console.log(error)
  			})
	}

    function close(){
        emit('close')
    }

    function addElements(ontoName, className){
        console.log("adding started")
        console.log(ontoName + className)
        let elements_json = addOnto(ontoName, className)
        console.log(elements_json)
        emit('add', elements_json)
    }

    // get all classes from Ontology.
    // They will be displayed in Dropdown menu to choose a super class when adding Processes/Materials.
	function readServerOntoClasses(name){
        if (name!=="new"){
            client.get('/onto/'+name+'/classes')
			.then(response => {
    			// handle success
				onto_classes.value = response.data
			})
  			.catch(error => {
    			// handle error
    			console.log(error.response)
  			})
        }
	}
    function readSubclasses(ontoName, className){
		client.get('/onto/'+ontoName+'/'+className+'/subclasses')
			.then(response => {
    			// handle success
    			console.log(response.data)
				onto_classes.value = response.data
				console.log(serverProcessOntologies.value)
			})
  			.catch(error => {
    			// handle error
    			console.log(error.response)
  			})
	}

    //function to add materials/Processes from Ontology to the Editor
    function addOnto(ontoName, className){
		client.get('/onto/'+ontoName+'/'+className+'/subclasses')
			.then(response => {
    			// handle success
    			console.log(response.data)
				response.data
                emit('add', response.data) 
			})
  			.catch(error => {
    			// handle error
    			console.log(error.response)
  			})
	}

    function onFileChange($event) {
            const target = $event.target;
            if (target && target.files) {
                current_file.value = target.files[0];
            }
        }

    //function to upload Ontologie to the server 
    function addOntoToServer(name, file){
        var formData = new FormData();
        formData.append("file", file);
        console.log("test")
        client.post('/onto', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
    			// handle success
    			console.log(response.data)
				console.log("test")
			})
  			.catch(error => {
    			// handle error
    			console.log(error.response)
  			})
    }

    readServerOntologies()
</script>



<template>
    <div id="addElements" class="settings">
        <div style="display: flex;">
            <h3 style="float:left;">Add {{ element_type }}</h3>
            <button @click="close">
                <span class="close-icons">X</span>
            </button>
        </div>
        <br/>
        <form>
            <span>Select Ontology: </span>
            
            <!--Drop down list of availible ontologys on the server-->
            <select v-model="current_ontology" name="Ontology" id="ontoSelect" 
                    @change="readServerOntoClasses(current_ontology)">
                <option :value="item" v-for="item in serverProcessOntologies">{{ item }}</option>
                <option value="new">add new to server</option>
            </select>

            <!-- button to update the drop down list of availible ontologies-->
            <button type='button' @click="readServerOntologies">
                <span class=reload>&#x21bb;</span>
            </button>

            <!--Dialog to add a new ontology to the server-->
            <div v-if="current_ontology === 'new'">
                <span>Choose a File or URL</span>
                <select v-model="addOption" id="addOption" >
                    <option value="file">File</option>
                    <option value="url">URL</option>
                </select>
                <br/>
                <div v-if="addOption==='url'">
                    <label for="url_input">Select URL: </label>
                    <input type="url" id="url_input"/>
                </div>
                <div v-else-if="addOption==='file'">
                    <label for="file_input">Select File: </label>
                    <input @change="$event => onFileChange($event)" type="file" id="file_input" enctype=multipart/form-data/>
                </div>
                <br/>
                <label for="add_to_server_btt">Add Ontology to Server: </label>
                <button class="button" type='button' @click="addOntoToServer('test.owl', current_file)">
                    <h5>ADD Ontology to Server</h5>
                </button>
            </div>

            <div v-else>
                <br/>
                <label for="super_class_select">Select Name of Superclass: </label>
                <select id="super_class_select"
                        v-model="current_super_class" 
                        name="super-class">
                    <option v-for="item in onto_classes" :value="item">{{ item }}</option>
                </select>
                <br/>
                <label for="relation_input">Name of Relation: </label>
                <input id="relation_input" type="text" value="subclass_of"/>
                <br/>
                <br/>
                <button id="add_elements_button" class="button" type='button' @click="addElements(current_ontology, current_super_class)">
                    <h5>ADD {{ element_type }} to Sidebar</h5>
                </button>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
    .settings{
        //position absolute on top of all
        position: absolute;
        z-index: 5;

        width: 60vw;
        height: auto;

        //position in middle
        left: 20vw;
        top: 20vh;

        background-color: var(--dark-alt);
        //border
        border-radius: 5px;
        border-width:1px;
        border-style:solid;
        border-color:black;

        justify-content: center;
        align-items: center;
    }
    .close-icons {
	    font-size: 1.5rem;
	    color: red;
	    transition: 0.2s ease-out;
	    float:right;
    }

    .reload {
        color: var(--primary);
        font-family: Lucida Sans Unicode;
        font-size: large;
    }

    .button{
        margin-left: 10px;
        margin-bottom: 10px;
        color: white;
        //border
        border-radius: 5px;
        border-width:1px;
        border-style:solid;
        border-color:white;
    }
</style>