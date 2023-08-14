import { mount } from "@vue/test-utils";
import Workspace from "../components/workspace.vue";
import { expect } from "vitest";

test("mount component", async () => {
    expect(Workspace).toBeTruthy();
});