import { mount } from "@vue/test-utils";
import Workspace from "../components/WorkspaceContainer.vue";
import { expect, test } from "vitest";

test("mount component", async () => {
    expect(Workspace).toBeTruthy();
});