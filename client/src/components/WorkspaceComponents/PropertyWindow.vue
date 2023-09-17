<template>
  <div class="property-window-content">
    <div>
      <button @click="close">
        <span class="material-icons">>></span>
      </button>
      <button class="deleteBtt" @click="deleteElement">
        <span>delete</span>
      </button>
      <button v-show='computedSelectedElement.type=="process"' class="openWorkspaceBtt" @click="openInWorkspace">
        <span>Open in Workspace</span>
      </button>
    </div>
    <h2>Properties</h2>
    <!--General Properties-->
    <label for="id">ID:</label>
    <input type="text" id="id" v-model="computedSelectedElement.id" readonly class="locked-input"/>

    <label for="description">Description:</label>
    <input type="text" id="description" v-model="computedSelectedElement.description"/>

    <!--Material Properties-->
    <div v-show='computedSelectedElement.type=="material"'></div>

    <!--Process Properties-->
    <div v-show='computedSelectedElement.type=="process"'>
      <label for="processElementType">processElementType:</label>
      <select id="processElementType" v-model="computedSelectedElement.processElementType">
        <option value="Process">Process</option>
        <option value="Process Stage">Process Stage</option>
        <option value="Process Operation">Process Operation</option>
        <option value="Process Action">Process Action</option>
      </select>
      <div>
        <h2>ProcessElementParameter</h2>
        <div v-for="(parameter, index) in computedSelectedElement.processElementParameter" :key="index" id="valueContainer">
          <label :for="'parameter_' + index + '_id'">ID:</label>
          <input type="text" :id="'parameter_' + index + '_id'" v-model="parameter.id" />
          <label :for="'parameter_' + index + '_description'">Description:</label>
          <input type="text" :id="'parameter_' + index + '_description'" v-model="parameter.description" />
          <label :for="'valueString'">ValueString:</label>
          <input type="text" :id="'valueString'" v-model="parameter.valueType.valueString" />
          <label :for="'dataType'">DataType:</label>
          <input type="text" :id="'dataType'" v-model="parameter.valueType.dataType" />
          <label :for="'unitOfMeasure'">UnitOfMeasure:</label>
          <input type="text" :id="'unitOfMeasure'" v-model="parameter.valueType.unitOfMeasure" />
          <label :for="'key'">Key:</label>
          <input type="text" :id="'key'" v-model="parameter.valueType.key" />
          <!--<ValueTypeProperty
            v-if="parameter.valueType"
            :valueType="parameter.valueType" 
            @update:valueType="parameter.valueType = $event"
          />-->
        </div>
        <button @click="addProcessElementParameter" id="addProcessElementParameter">
          <span class="material-icons">+</span>
        </button>
      </div>
      <div>
        <h2>OtherValue</h2>
        <div v-for="(otherValue, index) in computedSelectedElement.otherValue" :key="index" id="valueContainer">
          <label :for="'otherValue_' + index + '_id'">ID:</label>
          <input type="text" :id="'otherValue_' + index + '_id'" v-model="otherValue.id" />
          <label :for="'otherValue_' + index + '_description'">Description:</label>
          <input type="text" :id="'otherValue_' + index + '_description'" v-model="otherValue.description" />
          <label :for="'valueString'">ValueString:</label>
          <input type="text" :id="'otherValue_' + index + '_valueString'" v-model="otherValue.valueType.valueString" />
          <label :for="'dataType'">DataType:</label>
          <input type="text" :id="'otherValue_' + index + '_dataType'" v-model="otherValue.valueType.dataType" />
          <label :for="'unitOfMeasure'">UnitOfMeasure:</label>
          <input type="text" :id="'otherValue_' + index + '_unitOfMeasure'" v-model="otherValue.valueType.unitOfMeasure" />
          <label :for="'key'">Key:</label>
          <input type="text" :id="'otherValue_' + index + '_key'" v-model="otherValue.valueType.key" />
        </div>
        <button @click="addOtherValue" id="addOtherValue">
          <span class="material-icons">+</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, defineProps, defineEmits} from 'vue';
  import ValueTypeProperty from './ValueTypeProperty.vue';

  const props = defineProps(['selectedElement']);
  const emit = defineEmits(['close', 'openInWorkspace', 'deleteElement', 'update:selectedElement']);

  // Create a computed property that represents the entire selectedElement
  // this is recommended solution to achieve two way binding between the parent and this child component
  // this way the parent component is the only one setting values.
  // it define a get and set method:
  //    -get: take the given object from the parent
  //    -set: emit to parent new object. The parent then sets the new value
  const computedSelectedElement = computed({
    get: () => props.selectedElement,
    set: (newValue) => {
      emit('update:selectedElement', newValue);
    },
  });
  
  function close() {
    emit('close');
  }

  function openInWorkspace() {
    emit('openInWorkspace');
  }

  function addProcessElementParameter() {
    if (!Array.isArray(computedSelectedElement.value.processElementParameter)){
      computedSelectedElement.value.processElementParameter = []  
    }
    computedSelectedElement.value.processElementParameter.push({id:'', description:'', valueType:{valueString:'', dataType:'', unitOfMeasure:'', key:''}});
  }
  function addOtherValue() {
    if (!Array.isArray(computedSelectedElement.value.otherValue)){
      computedSelectedElement.value.otherValue = []  
    }
    computedSelectedElement.value.otherValue.push({id:'', description:'', valueType:{valueString:'', dataType:'', unitOfMeasure:'', key:''}});
  }

  function deleteElement(){
    emit('deleteElement', props.selectedElement)
  }
</script>

  
<style scoped>
  #valueContainer{
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
