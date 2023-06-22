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
            <span>Select Ontology to add {{ element_type }}: </span>
            
            <!--Drop down list of availible ontologys on the server-->
            <select v-model="current_ontology" name="Ontology" id="ontoSelect" 
                    @change="readServerOntoClasses(current_ontology)">
                <option :value="item" v-for="item in serverProcessOntologies">{{ item }}</option>
                <option value="new">add new to server</option>
            </select>

            <!-- button to update the drop down list of availible ontologies-->
            <button @click="readServerOntologies">
                <span class=reload>&#x21bb;</span>
            </button>

            <!--Dialog to add a new ontology to the server-->
            <fieldset v-if="current_ontology === 'new'">
                <legend>Add new Ontology to server: </legend>
                <span>Please enter a valid path to either an Ontologie File or URL</span>
                <br/>
                <label for="url_input">Select URL: </label>
                <input type="url" id="url_input"/>
                <br/>
                <span>OR</span>
                <br/>
                <label for="file_input">Select File: </label>
                <input type="file" id="file_input"/>
                <br/>
                <label for="add_to_server_btt">Add Ontology to Server: </label>
                <input type="submit" id="add_to_server_btt"/>
            </fieldset>

            <br/>
            <span></span>
            <label for="super_class_select">Select Ontology to add: </label>
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
            <button class="button" @click="addElements(current_ontology, current_super_class)">
                <h5>ADD {{ element_type }} to Sidebar</h5>
            </button>
        </form>
    </div>
</template>

<script setup>
    import {defineEmits, defineProps, ref, toRefs, reactive} from 'vue'
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
    const current_super_class = ref('')
	const serverProcessOntologies = ref([""])
	const onto_classes = ref([])
    const current_Elements = ref({})

	const client = axios.create({
    	//baseURL: process.env.VUE_APP_BASE_URL
		baseURL: ''
	});

    function readServerOntologies(){
		client.get('/onto')
			.then(response => {
    			// handle success
    			console.log(response.data)
				console.log("test")
				serverProcessOntologies.value = response.data
				console.log(serverProcessOntologies.value)
				console.log("test2")
			})
  			.catch(error => {
    			// handle error
    			console.log(error.response)
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

	function readServerOntoClasses(name){
        if (name!=="new"){
            client.get('/onto/'+name+'/classes')
			.then(response => {
    			// handle success
    			console.log(response.data)
				console.log("test")
				onto_classes.value = response.data
				console.log(serverProcessOntologies.value)
				console.log("test2")
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

    readServerOntologies()
</script>

<style lang="scss" scoped>
    .settings{
        //position absolute on top of all
        position: absolute;
        z-index: 0;

        width: 60vw;
        height: auto;

        //position in middle
        left: 20vw;
        top: 20vh;

        background-color: lightgray;
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
        font-family: Lucida Sans Unicode;
        font-size: large;
    }

    .button{
        margin-left: 10px;
        margin-bottom: 10px;
        //border
        border-radius: 5px;
        border-width:1px;
        border-style:solid;
        border-color:black;
    }
</style>