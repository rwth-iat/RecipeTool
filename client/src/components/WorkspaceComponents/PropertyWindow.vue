<template>
  <div class="property-window-content">
    <div>
      <button @click="close">
        <span class="material-icons">>></span>
      </button>
    </div>
    <h2>Properties</h2>
    <!--General Properties-->
    <label for="id">ID:</label>
    <input type="text" id="id" v-model="selectedElement.id" readonly class="locked-input"/>

    <label for="description">Description:</label>
    <input type="text" id="description" v-model="selectedElement.description" />

    <!--Material Properties-->
    <div v-show='selectedElement.type=="material"'>
    </div>

    <!--Process Properties-->
    <div v-show='selectedElement.type=="process"'>
      <label for="processElementType">processElementType:</label>
      <select type="text" id="processElementType" v-model="selectedElement.processElementType">
        <option value="Process">Process</option>
        <option value="Process Stage">Process Stage</option>
        <option value="Process Operation">Process Operation</option>
        <option value="Process Action">Process Action</option>
      </select>
      <div>
      <h2>ProcessElementParameter</h2>
      <div v-for="parameter in selectedElement.processElementParameter" id="parameter-container">
        <label :for="parameter+'_id'">ID:</label>
        <input type="text" :id="parameter+'_id'" v-model="parameter.id"/>

        <label :for="parameter+'_description'">Description:</label>
        <input type="text" :id="parameter+'_description'" v-model="parameter.description" />

        <!--value-->
        <label :for="parameter+'_valueString'">ValueString:</label>
        <input type="text" :id="parameter+'_valueString'" v-model="parameter.valueString" />
        <label :for="parameter+'_dataType'">DataType:</label>
        <input type="text" :id="parameter+'_dataType'" v-model="parameter.dataType" />
        <label :for="parameter+'_unitOfMeasure'">UnitOfMeasure:</label>
        <input type="text" :id="parameter+'_unitOfMeasure'" v-model="parameter.unitOfMeasure" />
        <label :for="parameter+'_key'">Key:</label>
        <input type="text" :id="parameter+'_key'" v-model="parameter.key" />
      </div>

      <button @click="addProcessElementParameter" id="addProcessElementParameter">
        <span class="material-icons">+</span>
      </button>


    </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, defineProps, defineEmits } from 'vue';

  const props = defineProps(['selectedElement']);
  const emit = defineEmits(['close']);  
  const close = () => {
    emit('close');
  };

  function addProcessElementParameter(){
    if(props.selectedElement.processElementParameter  === undefined){
      props.selectedElement.processElementParameter = [{}]  
    }else{
      props.selectedElement.processElementParameter.push({})
    }
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
  