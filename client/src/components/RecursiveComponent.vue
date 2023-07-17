<template>
  <ul>
    <li v-for="item in items" :key="item.name" @click="handleItemClick(item, $event)">
      <span
        :style="getIndentationStyle(indentationLevel)"
        :class="{ expandable: hasChildItems(item) }"
      ></span>
      {{ item.name }}
      <recursive-component
        v-if="item.expanded && hasChildItems(item)"
        :items="item.children"
        :indentationLevel="indentationLevel + 1"
        @click.stop
      />
    </li>
  </ul>
</template>

<script>
import { defineComponent, reactive } from 'vue';

export default defineComponent({
  name: 'RecursiveComponent',
  props: {
    items: {
      type: Object,
      required: true,
    },
    indentationLevel: {
      type: Number,
      default: 0,
    },
  },
  components: {
    RecursiveComponent: () => import('./RecursiveComponent.vue'),
  },
  setup(props) {
    const state = reactive({
      toggleItem(item) {
        item.expanded = !item.expanded;
      },
      hasChildItems(item) {
        return item.children && item.children.length > 0;
      },
      handleItemClick(item, event) {
        console.log('Clicked:', item.name);
        state.toggleItem(item);
        event.stopPropagation();
      },
    });

    return {
      ...state,
    };
  },
  methods: {
    getIndentationStyle(level) {
      const indentation = level * 20; // Adjust the indentation size as needed
      return {
        paddingLeft: `${indentation}px`,
      };
    },
  },
});
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.expandable {
  cursor: pointer;
}
</style>
