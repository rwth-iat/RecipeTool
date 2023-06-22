<script setup>
	//import vue from 'vue'
	import { ref, toRefs } from 'vue'
	import json from '../input/input.json'
	import addDialog from './addDialog.vue'

    //we define a prop elementtype so that we can use this component for materials and Processes 
    const props = defineProps({
        element_type: String,
    });
    const { element_type } = toRefs(props);
    
    var element_class = "" 
    if(element_type ==="Processes"){
        element_class = "process_element sidebar_element"
    }else{
        element_class = "material_element sidebar_element"
    }
	
    //sample data
    //let input = json
	let element_packages = ref({})
    //element_packages.value = input

	let addElementsOpen = ref(false) //variable to show/hide Add Elements diaglog

	function addElements(elements_json){
		console.log("materials in sidebar")
		element_packages.value = elements_json
	}

	// function to open/close add Elements window
	const toggleAddElements = () =>{
		addElementsOpen.value = !addElementsOpen.value;
	}

    //when starting to drag an element safe attributes to datatransfer, to access them in workspace component
	const dragstart = (event, id, name, classes) =>{
		console.log("dragstart")
		event.dataTransfer.dropEffect = "copy"
		event.dataTransfer.effectAllowed = "copy"
		event.dataTransfer.setData("itemID", id)
		event.dataTransfer.setData("itemName", name)
		event.dataTransfer.setData("itemClasses", classes)
	}
</script>

<template>
    <div id="elements_window">
        <div id="elements_heading">
            <div style="float:left;"><h4>{{ element_type }}</h4></div>
            <button @click="toggleAddElements">
                <span class="toggle-icons">+</span>
            </button>
        </div>
        <div class="element_spacer"></div>
        <div id="elements">
            <!-- into here get the process packages imported via the javascript script-->
            <div  v-for="(elements_package, elements_package_name) in element_packages">
                <div>{{ elements_package_name }}</div>
                <div class="element_spacer"></div>
                <div id="child_wrapper" v-for="element in elements_package.children">
                    <div id={{element.name}} :class=element_class 
                        @dragstart.preventDefault="$event => dragstart($event, 'testId', element.name, 'sidebar_element')"
                        draggable="true"
                    >
                        {{element.name}}
                    </div>
                    <div class="element_spacer"></div>
                </div>
                <div class="element_spacer"></div>
            </div>
        </div>
    </div>
    <!--
    this Dialog window is opened and closed by the addMaterials button
    but can also be closed from inside the components close button.
    To realize that we listen to the  @onClose event
        @Close handles what happens when child is closed
        @data is used as the Ontologies are added in subcomponent but we need the data here 
	-->
    <addDialog v-show="addElementsOpen" 
				:element_type=element_type
				@close="addElementsOpen= false"
				@add="addElements">
	</addDialog>
</template>


<style lang="scss" scoped>
.toggle-icons {
	font-size: 1.5rem;
	color: var(--primary);
	transition: 0.2s ease-out;
	float:right;
}

/*container for material*/
#elements_window{
    box-sizing: border-box;
    width: var(--sidebar-width);
    height: auto;
    float:left;
    vertical-align: top;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border-width:1px;
    border-style:solid;
    border-color:black;
}

#elements{
    box-sizing: border-box;
    align-items: center;
}

.sidebar_element{
    width: 200px;
    height: auto;
    text-align: center;
    border-radius: 5px;
    border-width:1px;
    border-style:solid;
    border-color:black;

    /*center this horizontally in the middle*/
    display: block;
    margin-left: auto;
    margin-right: auto;
}
.heading{
    text-align: center;
}
.element_spacer{
    height: var(--element-height);
}
</style>