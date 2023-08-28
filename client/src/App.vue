<script setup>
  import Topbar from './components/Topbar.vue'
  import Sidebar from './components/Sidebar.vue'
  import workspace from './components/workspace.vue'
  import { ref } from 'vue'
  
  const workspaceRef = ref(null);

  const callExportFunciton = () => {
    console.log("function call")
    workspaceRef.value.export_batchml();
  };
</script>

<template>
  <main>
    <topbar id="top_bar" @trigger-export="callExportFunciton"/>
    <div id="editor">
      <Sidebar id="side_bar"/>
      <workspace id="workspace" ref="workspaceRef"/>
    </div>
  </main>
</template>

<style lang="scss">
  :root {
    --primary: #4ade80;
    --primary-alt: #22c55e;
    --grey: #64748b;
    --dark: #1e293b;
    --dark-alt: #334155;
    --light: #f1f5f9;
    --sidebar-width: 300px;
    --topbar-height: 5vh;
    --element-height: 10px;
  }
  /*this blocks makes sure that the menu bar on the left is directly at the rim and no gap appears*/
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Fira sans', sans-serif;
  }
  header{
    background: var(--dark);
  }
  body {
    background: var(--light);
  }
  button {
    cursor: pointer;
    appearance: none;
    border: none;
    outline: none;
    background: none;
  }
  .app {
    display: flex;
    main {
      display: flex;
      flex-direction: row;
      height:100vh;
      width:100vw;
    }
  }
  #editor{
    overflow: hidden;
    box-sizing: border-box;
    width: 100vw;
    height: calc(100vh - var(--topbar-height));
    display: flex;
  }
  /*container for the page heading*/
#top_bar{
    width: 100vw;
    height: var(--topbar-height);
    float:left;
    text-align: center;
    background-color: var(--primary);
}
</style>
