import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  UiAccordion,
  UiAccordionContent,
  UiAccordionHeader,
  UiAccordionItem,
  UiAccordionTrigger
} from "./index";

// Import and register all accordion components
import "./index";

describe("Accordion Components", () => {
  beforeEach(() => {
    // Clean up DOM and any existing event listeners
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("Custom Element Registration", () => {
    it("should register all accordion custom elements", () => {
      expect(customElements.get("ui-accordion")).toBe(UiAccordion);
      expect(customElements.get("ui-accordion-item")).toBe(UiAccordionItem);
      expect(customElements.get("ui-accordion-header")).toBe(UiAccordionHeader);
      expect(customElements.get("ui-accordion-trigger")).toBe(
        UiAccordionTrigger
      );
      expect(customElements.get("ui-accordion-content")).toBe(
        UiAccordionContent
      );
    });
  });

  describe("UiAccordion", () => {
    let accordion: UiAccordion;

    beforeEach(() => {
      accordion = document.createElement("ui-accordion") as UiAccordion;
      document.body.appendChild(accordion);
    });

    it("should initialize with default state", () => {
      accordion.connectedCallback();
      const state = accordion.useRootStore.getState();
      expect(state.value).toBe(null); // defaultValue is null when no value attribute is set
      expect(state.mode).toBe("multiple");
      expect(state.collapsible).toBe(false);
      expect(state.disabled).toBe(false);
      expect(state.items).toEqual([]);
    });

    it("should handle mode attribute correctly", () => {
      accordion.setAttribute("mode", "single");
      const state = accordion.useRootStore.getState();
      expect(state.mode).toBe("single");
    });

    it("should handle collapsible attribute", () => {
      accordion.setAttribute("collapsible", "");
      const state = accordion.useRootStore.getState();
      expect(state.collapsible).toBe(true);
    });

    it("should handle disabled attribute", () => {
      accordion.setAttribute("disabled", "");
      const state = accordion.useRootStore.getState();
      expect(state.disabled).toBe(true);
    });

    it("should parse value attribute in single mode", () => {
      accordion.setAttribute("mode", "single");
      accordion.setAttribute("value", "item1");

      // Trigger connectedCallback
      accordion.connectedCallback();

      const state = accordion.useRootStore.getState();
      expect(state.value).toBe("item1");
    });

    it("should parse value attribute in multiple mode", () => {
      accordion.setAttribute("mode", "multiple");
      accordion.setAttribute("value", "item1,item2,item3");

      accordion.connectedCallback();

      const state = accordion.useRootStore.getState();
      expect(state.value).toEqual(["item1", "item2", "item3"]);
    });

    it("should emit onValueChange event when value changes", async () => {
      return new Promise<void>((resolve) => {
        accordion.addEventListener("onValueChange", (event: Event) => {
          const customEvent = event as CustomEvent;
          expect(customEvent.detail.value).toEqual(["test-value"]);
          resolve();
        });

        accordion.useRootStore.setState({ value: ["test-value"] });
      });
    });

    it("should handle dynamic attribute changes", () => {
      accordion.connectedCallback();

      accordion.setAttribute("disabled", "");
      expect(accordion.useRootStore.getState().disabled).toBe(true);

      accordion.removeAttribute("disabled");
      expect(accordion.useRootStore.getState().disabled).toBe(false);
    });

    it("should clean up subscriptions on disconnect", () => {
      accordion.connectedCallback();
      expect(accordion.unsubscribe).toBeDefined();

      const unsubscribeSpy = vi.fn();
      accordion.unsubscribe = unsubscribeSpy;

      accordion.disconnectedCallback();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe("UiAccordionItem", () => {
    let accordion: UiAccordion;
    let item: UiAccordionItem;

    beforeEach(() => {
      accordion = document.createElement("ui-accordion") as UiAccordion;
      item = document.createElement("ui-accordion-item") as UiAccordionItem;

      accordion.appendChild(item);
      document.body.appendChild(accordion);

      accordion.connectedCallback();
      item.connectedCallback();
    });

    it("should initialize with correct default state", () => {
      const state = item.useItemStore.getState();
      expect(state.value).toBe(null);
      expect(state.isOpen).toBe(false);
      expect(state.disabled).toBe(false);
    });

    it("should respect value attribute", () => {
      item.setAttribute("value", "test-item");
      item.connectedCallback();

      const state = item.useItemStore.getState();
      expect(state.value).toBe("test-item");
    });

    it("should open when value matches accordion value in single mode", () => {
      accordion.setAttribute("mode", "single");
      accordion.setAttribute("value", "item1");
      item.setAttribute("value", "item1");

      accordion.connectedCallback();
      item.connectedCallback();

      expect(item.useItemStore.getState().isOpen).toBe(true);
    });

    it("should open when value is in accordion value array in multiple mode", () => {
      accordion.setAttribute("mode", "multiple");
      accordion.setAttribute("value", "item1,item2");
      item.setAttribute("value", "item1");

      accordion.connectedCallback();
      item.connectedCallback();

      expect(item.useItemStore.getState().isOpen).toBe(true);
    });

    it("should toggle state correctly", () => {
      item.setAttribute("value", "test-item");
      item.connectedCallback();

      expect(item.useItemStore.getState().isOpen).toBe(false);

      item.toggle(true);
      expect(item.useItemStore.getState().isOpen).toBe(true);

      item.toggle(false);
      expect(item.useItemStore.getState().isOpen).toBe(false);
    });

    it("should respect collapsible setting in single mode", () => {
      accordion.setAttribute("mode", "single");
      accordion.setAttribute("collapsible", "");
      item.setAttribute("value", "test-item");

      accordion.connectedCallback();
      item.connectedCallback();

      item.toggle(true);
      expect(item.useItemStore.getState().isOpen).toBe(true);

      // Should be able to close when collapsible is true
      item.toggle(false);
      expect(item.useItemStore.getState().isOpen).toBe(false);
    });

    it("should close other items in single mode when opening", () => {
      const item2 = document.createElement(
        "ui-accordion-item"
      ) as UiAccordionItem;
      accordion.appendChild(item2);

      accordion.setAttribute("mode", "single");
      item.setAttribute("value", "item1");
      item2.setAttribute("value", "item2");

      accordion.connectedCallback();
      item.connectedCallback();
      item2.connectedCallback();

      // Open first item
      item.toggle(true);
      expect(item.useItemStore.getState().isOpen).toBe(true);

      // Open second item should close first
      item2.toggle(true);
      expect(item.useItemStore.getState().isOpen).toBe(false);
      expect(item2.useItemStore.getState().isOpen).toBe(true);
    });

    it("should add itself to accordion items array", () => {
      item.setAttribute("value", "test-item");
      item.connectedCallback();

      const accordionState = accordion.useRootStore.getState();
      expect(accordionState.items).toContain(item);
    });

    it("should remove itself from accordion items array on disconnect", () => {
      item.setAttribute("value", "test-item");
      item.connectedCallback();

      let accordionState = accordion.useRootStore.getState();
      expect(accordionState.items).toContain(item);

      item.disconnectedCallback();

      accordionState = accordion.useRootStore.getState();
      expect(accordionState.items).not.toContain(item);
    });

    it("should provide open() and close() convenience methods", () => {
      item.setAttribute("value", "test-item");
      item.connectedCallback();

      item.open();
      expect(item.useItemStore.getState().isOpen).toBe(true);

      item.close();
      expect(item.useItemStore.getState().isOpen).toBe(false);
    });
  });

  describe("UiAccordionTrigger", () => {
    let accordion: UiAccordion;
    let item: UiAccordionItem;
    let trigger: UiAccordionTrigger;
    let button: HTMLButtonElement;

    beforeEach(() => {
      accordion = document.createElement("ui-accordion") as UiAccordion;
      item = document.createElement("ui-accordion-item") as UiAccordionItem;
      trigger = document.createElement(
        "ui-accordion-trigger"
      ) as UiAccordionTrigger;
      button = document.createElement("button");

      trigger.appendChild(button);
      item.appendChild(trigger);
      accordion.appendChild(item);
      document.body.appendChild(accordion);

      item.setAttribute("value", "test-item");

      accordion.connectedCallback();
      item.connectedCallback();
      trigger.connectedCallback();
    });

    it("should set correct ARIA attributes on button", () => {
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(button.getAttribute("type")).toBe("button");
      expect(button.hasAttribute("aria-controls")).toBe(true);
      expect(button.hasAttribute("id")).toBe(true);
    });

    it("should update ARIA attributes when item state changes", () => {
      expect(button.getAttribute("aria-expanded")).toBe("false");

      item.toggle(true);
      expect(button.getAttribute("aria-expanded")).toBe("true");

      item.toggle(false);
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });

    it("should trigger item toggle on button click", () => {
      const toggleSpy = vi.spyOn(item, "toggle");

      button.click();
      expect(toggleSpy).toHaveBeenCalled();
    });

    it("should set data-state attributes", () => {
      expect(trigger.getAttribute("data-state")).toBe("closed");
      expect(button.getAttribute("data-state")).toBe("closed");

      item.toggle(true);
      expect(trigger.getAttribute("data-state")).toBe("open");
      expect(button.getAttribute("data-state")).toBe("open");
    });

    it("should handle disabled state", () => {
      // Set disabled on accordion root
      accordion.setAttribute("disabled", "");
      accordion.connectedCallback();

      // The subscription should update the attributes automatically
      expect(button.getAttribute("data-disabled")).toBe("");
    });

    it("should clean up event listeners on disconnect", () => {
      const removeEventListenerSpy = vi.spyOn(button, "removeEventListener");

      trigger.disconnectedCallback();
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe("UiAccordionHeader", () => {
    let accordion: UiAccordion;
    let item: UiAccordionItem;
    let header: UiAccordionHeader;

    beforeEach(() => {
      accordion = document.createElement("ui-accordion") as UiAccordion;
      item = document.createElement("ui-accordion-item") as UiAccordionItem;
      header = document.createElement(
        "ui-accordion-header"
      ) as UiAccordionHeader;

      item.appendChild(header);
      accordion.appendChild(item);
      document.body.appendChild(accordion);

      item.setAttribute("value", "test-item");

      accordion.connectedCallback();
      item.connectedCallback();
      header.connectedCallback();
    });

    it("should set heading role and aria-level", () => {
      expect(header.getAttribute("role")).toBe("heading");
      expect(header.getAttribute("aria-level")).toBe("3");
    });

    it("should respect custom level attribute", () => {
      header.setAttribute("level", "2");
      header.connectedCallback();

      expect(header.getAttribute("aria-level")).toBe("2");
    });

    it("should set data-state attributes", () => {
      expect(header.getAttribute("data-state")).toBe("closed");

      item.toggle(true);
      expect(header.getAttribute("data-state")).toBe("open");
    });

    it("should not override existing role attribute", () => {
      header.setAttribute("role", "banner");
      header.connectedCallback();

      expect(header.getAttribute("role")).toBe("banner");
    });
  });

  describe("UiAccordionContent", () => {
    let accordion: UiAccordion;
    let item: UiAccordionItem;
    let content: UiAccordionContent;
    let trigger: UiAccordionTrigger;
    let button: HTMLButtonElement;

    beforeEach(() => {
      accordion = document.createElement("ui-accordion") as UiAccordion;
      item = document.createElement("ui-accordion-item") as UiAccordionItem;
      trigger = document.createElement(
        "ui-accordion-trigger"
      ) as UiAccordionTrigger;
      content = document.createElement(
        "ui-accordion-content"
      ) as UiAccordionContent;
      button = document.createElement("button");

      trigger.appendChild(button);
      item.appendChild(trigger);
      item.appendChild(content);
      accordion.appendChild(item);
      document.body.appendChild(accordion);

      item.setAttribute("value", "test-item");

      accordion.connectedCallback();
      item.connectedCallback();
      trigger.connectedCallback();
      content.connectedCallback();
    });

    it("should set correct ARIA attributes", () => {
      expect(content.getAttribute("role")).toBe("region");
      expect(content.hasAttribute("aria-labelledby")).toBe(true);
      expect(content.hasAttribute("id")).toBe(true);
    });

    it("should set hidden attribute when closed", () => {
      expect(content.getAttribute("hidden")).toBe("until-found");
      expect(content.getAttribute("data-state")).toBe("closed");
    });

    it("should remove hidden attribute when open", () => {
      item.toggle(true);
      expect(content.hasAttribute("hidden")).toBe(false);
      expect(content.getAttribute("data-state")).toBe("open");
    });

    it("should handle CSS custom property for animations", () => {
      // Mock scrollHeight
      Object.defineProperty(content, "scrollHeight", {
        value: 100,
        configurable: true
      });

      item.toggle(true);

      // Should set CSS custom property for animation
      expect(content.style.getPropertyValue("--accordion-content-height")).toBe(
        "100px"
      );
    });

    it("should clean up animation properties on transition end", async () => {
      // Mock scrollHeight and transition
      Object.defineProperty(content, "scrollHeight", {
        value: 100,
        configurable: true
      });

      // Mock getComputedStyle to return transition duration
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        transitionDuration: "0.3s"
      });
      Object.defineProperty(window, "getComputedStyle", {
        value: mockGetComputedStyle
      });

      item.toggle(true);

      // Simulate transition end
      const transitionEndEvent = new Event("transitionend");
      content.dispatchEvent(transitionEndEvent);

      expect(content.hasAttribute("data-ending-style")).toBe(false);
      expect(content.style.getPropertyValue("--accordion-content-height")).toBe(
        ""
      );
    });
  });

  describe("Integration Tests", () => {
    let accordion: UiAccordion;

    beforeEach(() => {
      document.body.innerHTML = `
        <ui-accordion mode="single" value="item1">
          <ui-accordion-item value="item1">
            <ui-accordion-header>
              <ui-accordion-trigger>
                <button>Item 1</button>
              </ui-accordion-trigger>
            </ui-accordion-header>
            <ui-accordion-content>
              <p>Content 1</p>
            </ui-accordion-content>
          </ui-accordion-item>
          <ui-accordion-item value="item2">
            <ui-accordion-header>
              <ui-accordion-trigger>
                <button>Item 2</button>
              </ui-accordion-trigger>
            </ui-accordion-header>
            <ui-accordion-content>
              <p>Content 2</p>
            </ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `;

      accordion = document.querySelector("ui-accordion") as UiAccordion;
      accordion.connectedCallback();

      // Initialize all components
      const items = document.querySelectorAll("ui-accordion-item");
      const triggers = document.querySelectorAll("ui-accordion-trigger");
      const contents = document.querySelectorAll("ui-accordion-content");
      const headers = document.querySelectorAll("ui-accordion-header");

      for (const item of Array.from(items)) {
        (item as UiAccordionItem).connectedCallback();
      }
      for (const trigger of Array.from(triggers)) {
        (trigger as UiAccordionTrigger).connectedCallback();
      }
      for (const content of Array.from(contents)) {
        (content as UiAccordionContent).connectedCallback();
      }
      for (const header of Array.from(headers)) {
        (header as UiAccordionHeader).connectedCallback();
      }
    });

    it("should initialize with correct default values", () => {
      const item1 = document.querySelector(
        'ui-accordion-item[value="item1"]'
      ) as UiAccordionItem;
      const item2 = document.querySelector(
        'ui-accordion-item[value="item2"]'
      ) as UiAccordionItem;

      if (item1 && item2) {
        expect(item1.useItemStore.getState().isOpen).toBe(true);
        expect(item2.useItemStore.getState().isOpen).toBe(false);
      } else {
        throw new Error("Items not found in DOM");
      }
    });

    it("should handle complete user interaction flow", () => {
      const button1 = document.querySelector(
        'ui-accordion-item[value="item1"] button'
      ) as HTMLButtonElement;
      const button2 = document.querySelector(
        'ui-accordion-item[value="item2"] button'
      ) as HTMLButtonElement;
      const item1 = document.querySelector(
        'ui-accordion-item[value="item1"]'
      ) as UiAccordionItem;
      const item2 = document.querySelector(
        'ui-accordion-item[value="item2"]'
      ) as UiAccordionItem;

      if (button1 && button2 && item1 && item2) {
        // Initial state: item1 open, item2 closed
        expect(item1.useItemStore.getState().isOpen).toBe(true);
        expect(item2.useItemStore.getState().isOpen).toBe(false);

        // Click item2 button - should close item1 and open item2 (single mode)
        button2.click();
        expect(item1.useItemStore.getState().isOpen).toBe(false);
        expect(item2.useItemStore.getState().isOpen).toBe(true);

        // Click item1 button - should close item2 and open item1
        button1.click();
        expect(item1.useItemStore.getState().isOpen).toBe(true);
        expect(item2.useItemStore.getState().isOpen).toBe(false);
      } else {
        throw new Error("Required elements not found in DOM");
      }
    });

    it("should update accordion value attribute when items toggle", () => {
      const button2 = document.querySelector(
        'ui-accordion-item[value="item2"] button'
      ) as HTMLButtonElement;

      if (button2) {
        button2.click();
        expect(accordion.getAttribute("value")).toBe("item2");
      } else {
        throw new Error("Button not found in DOM");
      }
    });

    it("should emit onValueChange events during interactions", async () => {
      const button2 = document.querySelector(
        'ui-accordion-item[value="item2"] button'
      ) as HTMLButtonElement;

      return new Promise<void>((resolve) => {
        accordion.addEventListener("onValueChange", (event: Event) => {
          const customEvent = event as CustomEvent;
          expect(customEvent.detail.value).toBe("item2");
          resolve();
        });

        button2.click();
      });
    });
  });
});
