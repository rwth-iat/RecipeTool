<script setup>
import { ref, onMounted, onUpdated, watch, nextTick } from 'vue';
import { newInstance, ready } from "@jsplumb/browser-ui";

const workspace_items = ref([]);
let instance = null;
const jsplumbElementEndpoints = ref({});

const workspace = ref(null);

onMounted(() => {
  workspace.value.focus();

  instance = newInstance({
    container: workspace.value
  });
});

async function addJsPlumbEndpoint(element, itemId) {
  await nextTick();

  if (element) {
    instance.addEndpoint(element, { source: true, anchor: "Right",  endpoint: { type:"Dot"} });
    instance.addEndpoint(element, { target: true, anchor: "Left",   endpoint: { type:"Dot"} });

    jsplumbElementEndpoints.value[itemId] = element;
  }
}

function updateItemList(newItems) {
  newItems.forEach(item => {
    const elementRef = jsplumbElementEndpoints.value[item.id];
    if (!elementRef) {
      addJsPlumbEndpoint(elementRef, item.id);
    }
  });
}

watch(workspace_items, updateItemList, { deep: true });

const log = (event) => {
  console.log(event);
};

function editWorkspaceItems(id, name, type, x, y) {
  var item = workspace_items.value.find(b => b.id === id);
  if (item) {
    item.name = name;
    item.type = type;
    item.x = x;
    item.y = y;
  } else {
    workspace_items.value.push({ id, name, type, x, y });
  }
}

const onDrop = (event) => {
  console.log("Drop");
  event.preventDefault();
  var id = event.dataTransfer.getData("itemID");
  var name = event.dataTransfer.getData("itemName");
  var classes = event.dataTransfer.getData("itemClasses");

  //get mouse postion and substrac workspace position to get relative position as workspace elemenets are positioned relative (is needed for jsplumb)
  var rect = event.target.getBoundingClientRect();
  var x = event.clientX - rect.left + "px"; //x position within the element.
  var y = event.clientY - rect.top  + "px";

  if (classes.includes("sidebar_element")) {
    var unique_id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    workspace_items.value.push({ id: unique_id, name: name, type: "process", x: x, y: y });
    console.log("dragged from sidebar, dropped in workspace at absolute position: " + event.clientX.toString() + " " + event.clientY.toString());
    console.log(workspace_items);
  } else if (classes.includes("workspace_element")) {
    editWorkspaceItems(id, name, "process", x, y);
    console.log(workspace_items);
  }
};
</script>

<template>
  <div id="workspace" ref="workspace" @drop="$event => onDrop($event)" @dragenter.prevent @dragover.prevent>
    <div class="workspace_element" v-for="item in workspace_items" :key="item.id" :ref="addJsPlumbEndpoint" :style="{left:item.x, top:item.y}">
      {{ item.name }}
    </div>
  </div>
</template>

<style>
  #workspace {
    position: relative;
    width: 100vw;
    height: calc(100vh - var(--topbar-height));
    flex: 1 1 0;
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    background-size: 40px 40px;
    background-image: radial-gradient(circle, #000 1px, rgba(0, 0, 0, 0) 1px);
  }

  .workspace_element {
    position: absolute;
    width: 200px;
    height: auto;
    text-align: center;
    border-radius: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
  }
</style>
