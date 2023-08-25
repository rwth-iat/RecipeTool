<template>
    <div class="property-window-content">
      <h2>Property Window</h2>
      <label for="name">Name:</label>
      <input type="text" id="name" v-model="name" />
  
      <label for="id">ID:</label>
      <input type="text" id="id" v-model="id" />
  
      <button @click="close">Close</button>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  const { name: initialName, id: initialId } = defineProps(['name', 'id']);
  const emit  = defineEmits(['close']);
  
  const name = ref(initialName);
  const id = ref(initialId);
  
  const close = () => {
    emit('close');
  };
  </script>
  
  <style scoped>
    .property-window-content {
        width: 33%; /* Set the width to one third of the screen */
        min-width: 300px; /* Set a minimum width to ensure content fits */
        height: calc(100vh - var(--topbar-height));
        position: fixed;
        top: var(--topbar-height);
        right: 0;
        background-color: var(--dark);
        color: var(--light);
        /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);*/
        box-sizing: border-box;
        display: flex;
        flex-direction: column; /* Arrange children vertically */
        padding: 20px;
        transition: transform 0.8s ease-in-out; /* Adjust the duration as needed */
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

    .property-window-content button {
        margin-top: auto; /* Push the button to the bottom */
    }
  </style>
  