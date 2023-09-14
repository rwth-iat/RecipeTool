<template>
  <div class="property-window-content">
    <div>
      <button @click="close">
        <span class="material-icons">>></span>
      </button>
      <button class="deleteBtt" @click="deleteElement">
        <span>delete</span>
      </button>
      <button v-show='selectedElement.type=="process"' class="openWorkspaceBtt" @click="openInWorkspace">
        <span>Open in Workspace</span>
      </button>
    </div>
    <h2>Properties</h2>
    <!--General Properties-->
    <label for="id">ID:</label>
    <input type="text" id="id" v-model="selectedElementProperties.id" readonly class="locked-input" />

    <label for="description">Description:</label>
    <input type="text" id="description" v-model="selectedElementProperties.description" />

    <!--Material Properties-->
    <div v-show='selectedElement.type=="material"'></div>

    <!--Process Properties-->
    <div v-show='selectedElement.type=="process"'>
      <label for="processElementType">processElementType:</label>
      <select id="processElementType" v-model="selectedElementProperties.processElementType">
        <option value="Process">Process</option>
        <option value="Process Stage">Process Stage</option>
        <option value="Process Operation">Process Operation</option>
        <option value="Process Action">Process Action</option>
      </select>
      <div>
        <h2>ProcessElementParameter</h2>
        <div v-for="(parameter, index) in selectedElement.processElementParameter" :key="index" id="parameter-container">
          <label :for="'parameter_' + index + '_id'">ID:</label>
          <input type="text" :id="'parameter_' + index + '_id'" v-model="parameterProperties[index].id" />
          <label :for="'parameter_' + index + '_description'">Description:</label>
          <input type="text" :id="'parameter_' + index + '_description'" v-model="parameterProperties[index].description" />
          <label :for="'parameter_' + index + '_valueString'">ValueString:</label>
          <input type="text" :id="'parameter_' + index + '_valueString'" v-model="parameterProperties[index].valueString" />
          <label :for="'parameter_' + index + '_dataType'">DataType:</label>
          <input type="text" :id="'parameter_' + index + '_dataType'" v-model="parameterProperties[index].valueString" />
          <label :for="'parameter_' + index + '_unitOfMeasure'">UnitOfMeasure:</label>
          <input type="text" :id="'parameter_' + index + '_unitOfMeasure'" v-model="parameterProperties[index].valueString" />
          <label :for="'parameter_' + index + '_key'">Key:</label>
          <input type="text" :id="'parameter_' + index + '_key'" v-model="parameterProperties[index].valueString" />
        </div>

        <button @click="addProcessElementParameter" id="addProcessElementParameter">
          <span class="material-icons">+</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['selectedElement']);
const emit = defineEmits(['close', 'openInWorkspace']);

const selectedElementProperties = computed(() => {
  return {
    id: props.selectedElement.id,
    description: props.selectedElement.description,
    processElementType: props.selectedElement.description,
    processElementParameter: props.selectedElement.processElementParameter
  };
});

const parameterProperties = computed(() => {
  return props.selectedElement.processElementParameter.map((parameter) => ({
    id: parameter.id || '',
    description: parameter.description || '',
    valueString: parameter.valueString || '',
    dataType: parameter.dataType || '',
    unitOfMeasure: parameter.unitOfMeasure || '',
    key: parameter.key || '',
    // Add other properties from parameter as needed
  }));
});

function close() {
  emit('close');
}

function openInWorkspace() {
  emit('openInWorkspace');
}

function addProcessElementParameter() {
  selectedElementProperties.value.processElementParameter.push({});
}
</script>

  
  <style scoped>
    #parameter-container{
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    input.locked-input, textarea { 
      background: lightslategrey; 
    }
    .property-window-content {
        overflow-y: scroll;
        height: calc(100vh - var(--topbar-height));
        float:right;
        background-color: var(--dark);
        color: var(--light);
        /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);*/
        box-sizing: border-box;
        display: flex;
        flex-direction: column; /* Arrange children vertically */
        padding: 20px;
        transition: transform 0.8s ease-in-out; /* Adjust the duration as needed */
        border-radius: 5px;
    }
    .deleteBtt{
        margin-left: 15px;
        padding: 5px;
        color: red;
        float: right;
        background-color: var(--light) ;
        border: 1px solid red;
        border-radius: 4px;
        box-sizing: border-box;
    }
    .openWorkspaceBtt{
        padding: 5px;
        color: black;
        float: right;
        background-color: var(--light) ;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

	.material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-in-out;
    }

    .property-window-content h2 {
        margin-top: 0;
    }

    .property-window-content label {
        display: block;
        margin-top: 10px;
    }

    .property-window-content input {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }
    
  </style>
  