import { mount, test } from "@vue/test-utils";
import Workspace from "../components/WorkspaceContainer.vue";
import { expect } from "vitest";

test("mount component", async () => {
    expect(Workspace).toBeTruthy();
});