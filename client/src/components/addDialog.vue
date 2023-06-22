<template>
    <div id="addProcesses" class="settings">
        <div style="display: flex;">
            <h3 style="float:left;">Add Processes</h3>
            <button @click="close">
                <span class="close-icons">X</span>
            </button>
        </div>
        <br/>
        
        <!-- button to update the drop down list of availible ontologies-->
        <button @click="readServerOntologies">
                <h3>Reload</h3>
        </button>
        <br/>
        
        <!--Drop down list of availible ontologys on the server-->
        <select v-model="receive_method" name="Ontology" id="ontoSelect" v-for="item in serverProcessOntologies">
            <option value="test">{{ item }}</option>
            <option value="new">add new to server</option>
        </select>

        <!--Dialog to add a new ontology to the server-->
        <div v-if="receive_method === 'new'">
            <span>Please enter a vlid path to either an Ontologie File or URL</span>
            <br/>
            <br/>
            <div>URL:<input type="url" label="URL"/></div>
            <br/>
            <div>File:<input type="file" label="filepath"/></div>
            <div><input type="submit" label="Add Ontology"/></div>
        </div>

        <br/>
        <div>Name of Process Super-Class:
            <select v-model="receive_method" name="cars" id="cars" v-for="item in serverProcessOntologies">
                <option value="test">{{ item }}</option>
            </select>
        </div>
        <div>
            Select relation: <input type="text" label="relation" value="is_subclass_of"/>
        </div>
        <br/>
        <div><input type="submit" label="add" @submit=""/></div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import axios from 'axios'

    const emit = defineEmits(['close'])

    //for dropdown
    const receive_method = ref()
	const serverProcessOntologies = ref(["test"])
	const onto_classes = ref([])

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
    			console.log(error)
  			})
	}

    function close(){
        emit('close')
    }

	function readServerOntoClasses(name){
		client.get('/onto/'+name)
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
    			console.log(error)
  			})
	}

    readServerOntologies()
</script>