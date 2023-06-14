<script setup>
  import Topbar from './components/Topbar.vue'
  import Sidebar from './components/Sidebar.vue'
  import workspace from './components/workspace.vue'
</script>

<template>
  <main>
    <topbar id="top_bar"/>
    <div id="editor">
      <Sidebar/>
      <workspace/>
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
    box-sizing: border-box;
    width: 100vw;
    height: 90vw;
    overflow:hidden;
    display: flex;
  }
  /*container for the page heading*/
#top_bar{
    width: 100vw;
    height: 10vh;
    float:left;
    /*border-radius: 5px;
    border-width:1px;
    border-style:solid;
    border-color:black;*/
}
</style>
