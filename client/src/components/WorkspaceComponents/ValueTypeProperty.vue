<template>
  <div v-if="computedValueType" class="container-with-border">
    <label :for="'valueString'">ValueString:</label>
    <input type="text" :id="'valueString'" v-model="computedValueType.valueString" />
    <label :for="'dataType'">DataType:</label>
    <input type="text" :id="'dataType'" v-model="computedValueType.dataType" />
    <label :for="'unitOfMeasure'">UnitOfMeasure:</label>
    <input type="text" :id="'unitOfMeasure'" v-model="computedValueType.unitOfMeasure" />
    <label :for="'key'">Key:</label>
    <input type="text" :id="'key'" v-model="computedValueType.key" />
  </div>
</template>

<script setup>
  import '@/assets/main.css'; //import global css
  import { computed } from 'vue'; 
  const props = defineProps(['valueType']);
  const emit = defineEmits(['update:valueType']);

  // Create a computed property that represents the entire selectedElement
  // this is recommended solution to achieve two way binding between the parent and this child component
  // this way the parent component is the only one setting values.
  // it define a get and set method:
  //    -get: take the given object from the parent
  //    -set: emit to parent new object. The parent then sets the new value
  const computedValueType = computed({
    get: () => props.valueType,
    set: (newValue) => {
      emit('update:valueType', newValue);
    },
  });
</script>

<style>
  /* Style inputs */
  input[type=text], select {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid var(--light);
    border-radius: 4px;
    box-sizing: border-box;
  }

  /* Style the submit button */
  input[type=submit] {
    width: 100%;
    background-color: #04AA6D;
    color: white;
    padding: 14px 20px;
    margin: 8px 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  /* Add a background color to the submit button on mouse-over */
  input[type=submit]:hover {
    background-color: #45a049;
  } 
</style>