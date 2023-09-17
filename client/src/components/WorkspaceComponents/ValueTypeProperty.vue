<template>
  <div v-if="computedValueType">
    Test
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

<script>
  import { defineProps, defineEmits, computed } from 'vue'; 
  const props = defineProps(['selectedElement']);
  const emit = defineEmits(['close', 'openInWorkspace', 'deleteElement', 'update:selectedElement']);

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