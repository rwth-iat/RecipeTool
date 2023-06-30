<script setup>
import { ref, onMounted, onUpdated, watch, nextTick } from 'vue';
import { newInstance, ready } from "@jsplumb/browser-ui";

const workspace_items = ref([]);
let instance = null;
const jsplumbElementEndpoints = ref({});

let drag = false;

const workspace = ref(null);
const test1 = ref(null);
const test2 = ref(null);

onMounted(() => {
  workspace.value.focus();

  instance = newInstance({
    container: workspace.value
  });

  ready(() => {
    function addEndpoints(element) {
      instance.addEndpoint(element, { source: true, anchor: "Right", endpoint: 'Dot' });
      instance.addEndpoint(element, { target: true, anchor: "Left", endpoint: 'Dot' });
    }

    addEndpoints(test1.value);
    addEndpoints(test2.value);
  });
});

async function addJsPlumbEndpoint(element, itemId) {
  await nextTick();

  if (element) {
    instance.addEndpoint(element);

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

  var x = event.clientX + "px";
  var y = event.clientY + "px";

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

const dragstart = (event, id, name, classes) => {
  console.log("dragstart");
  event.dataTransfer.dropEffect = "move";
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("itemID", id);
  event.dataTransfer.setData("itemName", name);
  event.dataTransfer.setData("itemClasses", classes);
  event.dataTransfer.setData("workspaceItems", workspace_items);
};
</script>

<template>
  <div id="workspace" ref="workspace" @drop="$event => onDrop($event)" @dragenter.prevent @dragover.prevent>
    <div class="workspace_element" v-for="item in workspace_items" :key="item.id" :ref="addJsPlumbEndpoint">
      {{ item.name }}
    </div>

    <div id="test1" ref="test1" class="workspace_element" draggable="true" @dragstart="$event => dragstart($event, 'test1', 'test1', 'workspace_element')">
      Test1
    </div>

    <div id="test2" ref="test2" class="workspace_element" draggable="true" @dragstart="$event => dragstart($event, 'test2', 'test2', 'workspace_element')">
      Test2
    </div>
  </div>
</template>

<style>
  #test1 {
    left: 500px;
    top: 300px;
  }

  #test2 {
    left: 800px;
    top: 300px;
  }

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
