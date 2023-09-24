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
    <div v-show='computedSelectedElement.type=="material"'>
      <label for="materialType">MaterialType:</label>
      <select id="materialType" v-model="computedSelectedElement.materialType">
        <option value="Input">Input</option>
        <option value="Intermediate">Intermediate</option>
        <option value="output">Output</option>
      </select>

      <label for="materialId">MaterialId:</label>
      <input type="text" id="materialId" v-model="computedSelectedElement.materialId"/>
      
      <label for="order">Order:</label>
      <input type="text" id="order" v-model="computedSelectedElement.order"/>
      
      <label for="amount">Amount:</label>
      <div id="valueContainer">
          <label :for="'valueString'">ValueString:</label>
          <input type="text" :id="'valueString'" v-model="computedSelectedElement.amount.valueString" />
          <label :for="'dataType'">DataType:</label>
          <input type="text" :id="'dataType'" v-model="computedSelectedElement.amount.dataType" />
          <label :for="'unitOfMeasure'">UnitOfMeasure:</label>
          <input type="text" :id="'unitOfMeasure'" v-model="computedSelectedElement.amount.unitOfMeasure" />
          <label :for="'key'">Key:</label>
          <input type="text" :id="'key'" v-model="computedSelectedElement.amount.key" />
      </div>
    </div>

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
        <div v-for="(otherInformation, index) in computedSelectedElement.otherInformation" :key="index" id="valueContainer">
          <label :for="'otherInformation_' + index + '_otherInfoID'">ID:</label>
          <input type="text" :id="'otherInformation_' + index + '_otherInfoID'" v-model="otherInformation.otherInfoID" />
          <label :for="'otherInformation_' + index + '_description'">Description:</label>
          <input type="text" :id="'otherInformation_' + index + '_description'" v-model="otherInformation.description[0]" />
          <label :for="'otherInformation_' + index + '_valueString'">ValueString:</label>
          <input type="text" :id="'otherInformation_' + index + '_valueString'" v-model="otherInformation.otherValue[0].valueString" />
          <label :for="'otherInformation_' + index + '_dataType'">DataType:</label>
          <input type="text" :id="'otherInformation_' + index + '_dataType'" v-model="otherInformation.otherValue[0].dataType" />
          <label :for="'otherInformation_' + index + '_unitOfMeasure'">UnitOfMeasure:</label>
          <input type="text" :id="'otherInformation_' + index + '_unitOfMeasure'" v-model="otherInformation.otherValue[0].unitOfMeasure" />
          <label :for="'otherInformation_' + index + '_key'">Key:</label>
          <input type="text" :id="'otherInformation_' + index + '_key'" v-model="otherInformation.otherValue[0].key" />
        </div>
        <button @click="addOtherValue" id="addOtherValue">
          <span class="material-icons">+</span>
        </button>
      </div>
      <div>
        <h2>Resource Constraint</h2>
        <div v-for="(resourceConstraint, index) in computedSelectedElement.resourceConstraint" :key="index" id="valueContainer">
          <label :for="'resourceConstraint_' + index + '_constraianedID'">ID:</label>
          <input type="text" :id="'resourceConstraint_' + index + '_constrainedID'" v-model="resourceConstraint.constrinedID" />
          <label :for="'resourceConstraint_' + index + '_description'">Description:</label>
          <input type="text" :id="'resourceConstraint_' + index + '_description'" v-model="resourceConstraint.description[0]" />
          <label :for="'resourceContstraint_' + index + '_constraintType'">ConstraintType:</label>
          <select :id="'resourceContstraint_' + index + '_constraintType'" v-model="resourceConstraint.constraintType">
            <option value="Required">Required</option>
            <option value="Optional">Optional</option>
            <option value="Other">Other</option>
          </select>
          <label :for="'resourceConstraint_' + index + '_lifeCycleState'">LifeCycleState:</label>
          <input type="text" :id="'resourceConstraint_' + index + '_lifeCycleState'" v-model="resourceConstraint.lifeCycleState" />
          <label :for="'resourceConstraint_' + index + '_range'">Range:</label>
          <ValueTypeProperty :valueType="resourceConstraint.range" @update:valueType="resourceConstraint.valueType = $event"></ValueTypeProperty>
          <label :for="'resourceConstraint_' + index + '_resourceConstraintProperty'">ResourceConstraintProperty:</label>
          <input type="text" :id="'resourceConstraint_' + index + '_resourceConstraintProperty'" v-model="resourceConstraint.resourceConstraintProperty" />
        </div>
        <button @click="addResourceConstraint" id="addResourceConstraint">
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
    computedSelectedElement.value.processElementParameter.push({id:'', description:[''], valueType:{valueString:'', dataType:'', unitOfMeasure:'', key:''}});
  }

  function addOtherValue() {
    if (!Array.isArray(computedSelectedElement.value.otherValue)){
      computedSelectedElement.value.otherValue = []  
    }
    computedSelectedElement.value.otherValue.push({id:'', description:[''], valueType:{valueString:'', dataType:'', unitOfMeasure:'', key:''}});
  }

  function addResourceConstraint() {
    if (!Array.isArray(computedSelectedElement.value.resourceConstraint)){
      computedSelectedElement.value.resourceConstraint = []  
    }
    computedSelectedElement.value.resourceConstraint.push({constraintID:'', description:[''], constraintType:'', lifeCycleState:'', range:{valueString:'', dataType:'', unitOfMeasure:'', key:''}, resourceConstraintProperty:''});
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
