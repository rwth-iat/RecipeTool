<script setup>
	//import vue from 'vue'
	import { ref, toRefs } from 'vue'
	import addDialog from './addDialog.vue'
    import Recursive_component from './RecursiveComponent.vue';
    import '@/assets/main.scss'; //import global css 

    //we define a prop elementtype so that we can use this component for materials and Processes 
    const props = defineProps({
        element_type: String,
    });
    const { element_type } = toRefs(props);
    


    let element_packages = ref({})

    let element_class = "" 
    if(element_type.value === "Processes"){
        element_class = "process_element sidebar_element"
        element_packages.value = [
                                {
                                    name: "Dosage Prep Stage:",
                                    type: "process",
                                    processElementType: "Process Stage"
                                },
                                {
                                    name: "Packaging Stage:",
                                    type: "process",
                                    processElementType: "Process Stage"
                                },
                                {
                                    name: "Wet Mixing Operation:",
                                    type: "process",
                                    processElementType: "Process Operation"
                                },
                                {
                                    name: "Dry Mixing Operation:",
                                    type: "process",
                                    processElementType: "Process Operation"
                                },
                                {
                                    name: "Tableting Operation:",
                                    type: "process",
                                    processElementType: "Process Operation"
                                },
                                {
                                    name: "Charge:",
                                    type: "process",
                                    processElementType: "Process Action"
                                },
                                {
                                    name: "Charge with Agitation:",
                                    type: "process",
                                    processElementType: "Process Action"
                                },
                                {
                                    name: "Charge to adjust pH:",
                                    type: "process",
                                    processElementType: "Process Action"
                                }
                            ]
    }else if (element_type.value ==="Materials"){
        element_class = "material_element sidebar_element"
        element_packages.value = [{
                            name:"Basic-Materials",
                            type: "material",
                            children:[
                                {
                                    type: "material",
                                    name: "Educt"
                                },
                                {
                                    type: "material",
                                    name: "Intermediate"
                                },
                                {
                                    type: "material",
                                    name: "Product"
                                }
                            ]
                        }]
    }else if (element_type.value ==="ChartElements"){
        element_class = "chart_element sidebar_element"
        element_packages.value = [{
                            name:"Basic",
                            type: "chart_element",
                            children:[
                                {
                                    type: "chart_element",
                                    name: "Previous Operation Indicator",
                                    procedureChartElementType: "Previous Operation Indicator"
                                },
                                {
                                    type: "chart_element",
                                    name: "Next Operation Indicator",
                                    procedureChartElementType: "Next Operation Indicator"
                                },
                                {
                                    type: "chart_element",
                                    name: "Start Parallel Indicator",
                                    procedureChartElementType: "Start Parallel Indicator"
                                },
                                {
                                    type: "chart_element",
                                    name: "End Parallel Indicator",
                                    procedureChartElementType: "End Parallel Indicator"
                                },
                                {
                                    type: "chart_element",
                                    name: "Start Optional Parallel Indicator",
                                    procedureChartElementType: "Start Optional Parallel Indicator"
                                },
                                {
                                    type: "chart_element",
                                    name: "End Optional Parallel Indicator",
                                    procedureChartElementType: "End Optional Parallel Indicator"
                                },
                                {
                                    type: "chart_element",
                                    name: "Annotation",
                                    procedureChartElementType: "Annotation"
                                },
                                {
                                    type: "chart_element",
                                    name: "Other",
                                    procedureChartElementType: "Other"
                                }
                            ]
                        }]
    }else{
        console.log("unknown element type: " + element_type.value)
    }

	function addElements(elements_json){
		console.log("materials in sidebar")
		element_packages.value = elements_json
	}

    let addElementsOpen = ref(false) //variable to show/hide Add Elements diaglog
    // function to open/close add Elements window
    const toggleAddElements = () =>{
		addElementsOpen.value = !addElementsOpen.value;
	}
</script>

<template>
    <div id="elements_window">
        <div>
            <div style="float:left;"><h2>{{ element_type }}</h2></div>
            <button @click="toggleAddElements">
                <span class="material-icons-light">+</span>
            </button>
        </div>
        <div class="element_spacer"></div>
        <div id="elements">
            <!-- into here get the process packages imported via the javascript script-->
            <Recursive_component :items=element_packages :indentationLevel="0" :classes=element_class>
            </Recursive_component>
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
    width: calc(var(--sidebar-width)*0.9);
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