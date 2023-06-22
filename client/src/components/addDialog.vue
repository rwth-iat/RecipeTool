<template>
    <div id="addProcesses" class="settings">
        <div style="display: flex;">
            <h3 style="float:left;">Add Processes</h3>
            <button @click="close">
                <span class="close-icons">X</span>
            </button>
        </div>
        <br/>
        <form>
            <span>Select Ontology to add</span>
            <!-- button to update the drop down list of availible ontologies-->
            <button @click="readServerOntologies">
                <span class=reload>&#x21bb;</span>
            </button>
            <br/>
            
            <!--Drop down list of availible ontologys on the server-->
            <select v-model="current_ontology" name="Ontology" id="ontoSelect" 
                    @change="readServerOntoClasses(current_ontology)">
                <option :value="item" v-for="item in serverProcessOntologies">{{ item }}</option>
                <option value="new">add new to server</option>
            </select>

            <!--Dialog to add a new ontology to the server-->
            <fieldset v-if="current_ontology === 'new'">
                <legend>Personalia:</legend>
                <span>Please enter a valid path to either an Ontologie File or URL</span>
                <br/>
                <input type="url" label="URL"/>
                <br/>
                <input type="file" label="File"/>
                <br/>
                <input type="submit" label="Add Ontology"/>
            </fieldset>

            <br/>
            Name of Process Super-Class:
            <select v-model="current_super_class" name="super-class" id="super-class">
                <option v-for="item in onto_classes" :value="item">{{ item }}</option>
            </select>
            <br/>
            <input type="text" label="name of relation" value="subclass_of"/>
            <br/>
            <button @click="addProcesses(current_ontology, current_super_class)">
                ADD
            </button>
        </form>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import axios from 'axios'

    const emit = defineEmits(['close', 'add'])

    //for dropdown
    const current_ontology = ref('')
    const current_super_class = ref('')
	const serverProcessOntologies = ref(["test"])
	const onto_classes = ref([])
    const current_processes = ref({})

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
    function addProcesses(ontoName, className){
        console.log("adding started")
        console.log(ontoName + className)
        let processes_json = addOnto(ontoName, className)
        console.log(processes_json)
        emit('add', processes_json)
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
</style>