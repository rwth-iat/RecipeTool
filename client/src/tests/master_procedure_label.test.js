import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import BreakableProcedureLabel from "@/features/master-recipe/ui/workspace/BreakableProcedureLabel.vue";
import MasterWorkspaceContent from "@/features/master-recipe/ui/workspace/MasterWorkspaceContent.vue";
import GeneralWorkspaceContent from "@/features/general-recipe/ui/workspace/GeneralWorkspaceContent.vue";

vi.mock("@jsplumb/browser-ui", () => ({
  EVENT_DRAG_STOP: "drag:stop",
  newInstance: vi.fn(),
  ready: vi.fn(),
}));

const LONG_PROCEDURE_ID =
  "001:2026-06-12_HC20_V3.0_MixingOfLiquids:StirringDuration";

describe("BreakableProcedureLabel", () => {
  test("keeps the complete procedure ID and adds one break opportunity per colon", () => {
    const wrapper = mount(BreakableProcedureLabel, {
      props: { value: LONG_PROCEDURE_ID },
    });

    expect(wrapper.element.textContent).toBe(LONG_PROCEDURE_ID);
    expect(wrapper.findAll("wbr")).toHaveLength(2);
  });

  test.each([
    { value: "Step001", expectedBreaks: 0 },
    { value: "", expectedBreaks: 0 },
    { value: "A:B:", expectedBreaks: 2 },
  ])(
    "renders '$value' unchanged with $expectedBreaks break opportunities",
    ({ value, expectedBreaks }) => {
      const wrapper = mount(BreakableProcedureLabel, {
        props: { value },
      });

      expect(wrapper.element.textContent).toBe(value);
      expect(wrapper.findAll("wbr")).toHaveLength(expectedBreaks);
    }
  );
});

describe("workspace label scope", () => {
  test("uses break opportunities for master procedures without changing transitions", () => {
    const wrapper = mount(MasterWorkspaceContent, {
      props: {
        main_workspace_items: [],
        workspace_items: [
          {
            id: LONG_PROCEDURE_ID,
            type: "procedure",
            processElementType: "Recipe Procedure Containing Lower Level PFC",
            x: 0,
            y: 0,
          },
          {
            id: "T1",
            type: "recipe_element",
            recipeElementType: "Condition",
            conditionGroup: {
              type: "group",
              operator: "AND",
              children: [],
            },
            x: 0,
            y: 200,
          },
        ],
      },
    });

    const procedureLabel = wrapper.get(".procedure-label");
    const conditionLabel = wrapper.get(".condition-text");

    expect(procedureLabel.element.textContent).toBe(LONG_PROCEDURE_ID);
    expect(procedureLabel.findAll("wbr")).toHaveLength(2);
    expect(conditionLabel.text()).toBe("True");
    expect(conditionLabel.findAll("wbr")).toHaveLength(0);
  });

  test("does not add colon break opportunities to general-recipe processes", () => {
    const wrapper = mount(GeneralWorkspaceContent, {
      props: {
        main_workspace_items: [],
        workspace_items: [
          {
            id: LONG_PROCEDURE_ID,
            type: "process",
            processElementType: "Process",
            x: 0,
            y: 0,
          },
        ],
      },
    });

    expect(wrapper.get(".process span").element.textContent).toBe(
      LONG_PROCEDURE_ID
    );
    expect(wrapper.findAll("wbr")).toHaveLength(0);
  });
});
