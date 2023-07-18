<script setup>
	//import vue from 'vue'
	import { ref, toRefs } from 'vue'
	import json from '../input/input.json'
	import addDialog from './addDialog.vue'
    import Recursive_component from './RecursiveComponent.vue';

    //we define a prop elementtype so that we can use this component for materials and Processes 
    const props = defineProps({
        element_type: String,
    });
    const { element_type } = toRefs(props);
    


    let element_packages = ref({})

    var element_class = "" 
    if(element_type.value === "Processes"){
        element_class = "process_element sidebar_element"
        element_packages.value = [{
                                    "name": "GeneralCapabilityEffecting",
                                    "type":"process",
                                    "children":[{
                                            "name": "Draining",
                                            "type":"process",
                                            "children":[
                                                {
                                                "type":"process",
                                                "name":"test1",
                                                "children":[
                                                    {
                                                        "name":"test2",
                                                        "type":"process"
                                                    }
                                                ]}
                                                ]
                                            },
                                            {
                                                "type": "process",
                                                "name": "Pumping"
                                            }
                                        ]
                                }]
    }else if (element_type.value ==="Materials"){
        element_class = "material_element sidebar_element"
        element_packages.value = [{
                            "name":"Grundmaterialien",
                            "type": "material",
                            "children":[
                                {
                                    "type": "material",
                                    "name": "Eingangsmaterial"
                                },
                                {
                                    "type": "material",
                                    "name": "Zwischenprodukt"
                                },
                                {
                                    "type": "material",
                                    "name": "Endprodukt"
                                }
                            ]
                        }]
    }else{
        console.log("unknown element type: " + element_type)
    }
	console.log(element_packages.value)
    //sample data
    //let input = json
	
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
            <Recursive_component :items=element_packages :indentationLevel="0" :class={element_class}>
            </Recursive_component>
            <!--
            <div  v-for="(elements_package, elements_package_name) in element_packages">
                <div>{{ elements_package_name }}</div>
                <div class="element_spacer"></div>
                <div id="child_wrapper" v-for="element in elements_package.children">
                    <div id={{element.name}} :class=element_class 
                        @dragstart.preventDefault="$event => dragstart($event, 'testId', element.name, element_class)"
                        draggable="true"
                    >
                        {{element.name}}
                    </div>
                    <div class="element_spacer"></div>
                </div>
                <div class="element_spacer"></div>
            </div>
            -->
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