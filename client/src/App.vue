<script setup>
  import Topbar from './components/Topbar.vue'
  import Sidebar from './components/Sidebar.vue'
  import workspace from './components/workspace.vue'
</script>

<template>
  <header>
    <topbar/>
  </header>

  <main>
      <Sidebar/>
      <workspace/>
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
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Fira sans', sans-serif;
  }
  header{
    background: var(--grey);
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
      flex: 1 1 0;
      padding: 2rem;
      @media (max-width: 1024px) {
        padding-left: 6rem;
      }
    }
  }
</style>
