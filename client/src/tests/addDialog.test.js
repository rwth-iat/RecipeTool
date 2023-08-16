import { mount } from "@vue/test-utils";
import addDialog from "../components/addDialog.vue";
import { expect } from "vitest";
import { setupServer } from 'msw/node'
import { rest } from 'msw'

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create an instance of the mock adapter
const mock = new MockAdapter(axios);

// Mock the GET requests
mock
  .onGet('/onto')
  .reply(200, [
    "Onto 1",
    "Onto 2"
  ]);

mock
  .onGet('/onto/test_ontology.owl/classes')
  .reply(200, [
    "Class A",
    "Class B",
    "Class C"
  ]);

mock
  .onGet('https://127.0.0.1:5000/onto/Capability_with_Query.owl/Combining/subclasses')
  .reply(200, [
    {
      age: 55,
      name: "tope"
    }
  ]);

// Rest of your test setup, for example:
// import your Vue component, mount it, and write your test cases

// After all tests, reset the mock adapter
afterAll(() => mock.reset());


test("mount Materials component", async () => {
   const wrapper = mount(addDialog, {
      propsData: {
         element_type: 'Materials'
      }
    })
   expect(wrapper.props().element_type).toBe('Materials')
   expect(addDialog).toBeTruthy();

});

test("mount Processes component", async () => {
   const wrapper = mount(addDialog, {
      propsData: {
         element_type: 'Processes'
      }
    })
   expect(wrapper.props().element_type).toBe('Processes')
   expect(addDialog).toBeTruthy();
});

test("list available ontologies as options", async () => {
   const wrapper = mount(addDialog, {
      propsData: {
         element_type: 'Processes'
      }
    })
   expect(wrapper.props().element_type).toBe('Processes')
   expect(addDialog).toBeTruthy();
   await wrapper.vm.$nextTick();
   await wrapper.vm.$nextTick();
   // Find the options select element using wrapper.find()
   const ontoSelect = wrapper.find('#ontoSelect');
   // Access the options property and check the length
   const numOptions = ontoSelect.element.options.length;
   // should in this test always be 2 as it has the "addnew" and "capability_with_query" 
   expect(numOptions).toBe(3)
   expect(ontoSelect.element.options[0].textContent).toBe('Onto 1');
   expect(ontoSelect.element.options[1].textContent).toBe('Onto 2');
   expect(ontoSelect.element.options[2].textContent).toBe('add new to server');
});

test("list classes of ontology as options", async () => {
   const wrapper = mount(addDialog, {
     propsData: {
       element_type: 'Processes'
     }
   });

   // Trigger the function that fetches ontology classes
   await wrapper.vm.readServerOntoClasses('test_ontology.owl');

   // Wait for the component to update after the API call
   await wrapper.vm.$nextTick();
   await wrapper.vm.$nextTick();


   // Now, find the options select element using wrapper.find()
   const classSelect = wrapper.find('#super_class_select');
   console.log(classSelect)
   // Access the options property and check the length
   const numOptions = classSelect.element.options.length;

   // Assertions
   expect(numOptions).toBe(3); // Adjust the expected number of options based on your mock response
   expect(classSelect.element.options[0].textContent).toBe('Class A');
   expect(classSelect.element.options[1].textContent).toBe('Class B');
   expect(classSelect.element.options[2].textContent).toBe('Class C');
 });

/*
test("has a button", () => {
    expect(wrapper.find("button").exists()).toBe(true);
});
  
test("Button clicked", async () => {
    const ac = await wrapper.get("button").trigger("click")
    expect(wrapper.vm.search).toEqual("")
})

test("test get ontologies", async () => {
    expect(Workspace).toBeTruthy();
});
*/