import { mount } from "@vue/test-utils";
import addDialog from "../components/addDialog.vue";
import { expect } from "vitest";
import { setupServer } from 'msw/node'
import { rest } from 'msw'

//intercepts the api calls in this test case and return the default values to test the component
export const restHandlers = [
    rest.get('https://127.0.0.1:5000/onto', (req, res, ctx) => {
       return res(ctx.status(200), ctx.json([
          {
             age: 55,
             name: "tope"
          }
       ]))
    }),
    rest.get('https://127.0.0.1:5000/Capability_with_Query.owl/classes', (req, res, ctx) => {
       return res(ctx.status(200), ctx.json([
          {
             age: 55,
             name: "tope"
          }
       ]))
    }),
    rest.get('https://127.0.0.1:5000/Capability_with_Query.owl/Combining/subclasses', (req, res, ctx) => {
       return res(ctx.status(200), ctx.json([
          {
             age: 55,
             name: "tope"
          }
       ]))
    }),
 ]
 /*
 const server = setupServer(...restHandlers)
 // Start server before all tests
 beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
 //  Close server after all tests
 afterAll(() => server.close())
 // Reset handlers after each test `important for test isolation`
 afterEach(() => server.resetHandlers())

test("mount component", async () => {
    expect(addDialog).toBeTruthy();
});
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