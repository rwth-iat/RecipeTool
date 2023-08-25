<template>
    <div class="property-window-content">
      <div>
        <button @click="close">
            <span class="material-icons">>></span>
        </button>
	    </div>
      <h2>Properties</h2>
      <label for="id">ID:</label>
      <input type="text" id="id" v-model="selectedElement.id" />
      
      <label for="description">Description:</label>
      <input type="text" id="description" v-model="selectedElement.description" />
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  const { selectedElement: initialSelectedElement} = defineProps(['selectedElement']);
  const emit  = defineEmits(['close']);
  
  const selectedElement = ref(initialSelectedElement);
  
  const close = () => {
    emit('close');
  };
  </script>
  
  <style scoped>
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
  