<template>
  <div id="topbar">
    <!--
    <button @click="import_config" style="float:'left'">
			<span class="close-icons">import</span>
    </button>
    <button @click="export_config" style="float:'left'">
			<span class="close-icons">export</span>
    </button>
    -->
    <button class="button-with-border" style="float:left;" @click="triggerExportInWorkspace">Export</button>
    <h3>General Recipe Editor</h3>
  </div>
</template>

<script setup>
  const emit = defineEmits(['trigger-export']);

  const triggerExportInWorkspace = () => {
    console.log("trigger-export")
    emit('trigger-export');
  };
</script>

<style lang="scss">
    /*container for the page heading*/
    #topbar{
      width: 100vw;
      height: auto;
      float:left;
      text-align: center;
      background-color: --grey;
      color:white;
      /*border-radius: 5px;
      border-width:1px;
      border-style:solid;
      border-color:black;*/
    }
    #exportBtt{
      float: left;
      display: flex;
    }
</style>
