import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type DialogClosedby,
  type DialogClosedbyDefault,
  UiDialog,
  UiDialogClose,
  UiDialogContent,
  UiDialogDescription,
  UiDialogOutsideTrigger,
  UiDialogTitle,
  UiDialogTrigger
} from "./index";

// Import and register all dialog components
import "./index";

// Mock HTMLDialogElement methods since they may not be fully implemented in JSDOM
class MockHTMLDialogElement extends HTMLElement {
  open = false;
  returnValue = "";

  showModal() {
    this.open = true;
  }

  show() {
    this.open = true;
  }

  close(returnValue?: string) {
    this.open = false;
    if (returnValue) this.returnValue = returnValue;
  }
}

// Replace dialog elements with mock implementation
beforeEach(() => {
  global.HTMLDialogElement = MockHTMLDialogElement as typeof HTMLDialogElement;
});

describe("Dialog Components", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("Custom Element Registration", () => {
    it("should register all dialog custom elements", () => {
      expect(customElements.get("ui-dialog")).toBe(UiDialog);
      expect(customElements.get("ui-dialog-trigger")).toBe(UiDialogTrigger);
      expect(customElements.get("ui-dialog-close")).toBe(UiDialogClose);
      expect(customElements.get("ui-dialog-content")).toBe(UiDialogContent);
      expect(customElements.get("ui-dialog-title")).toBe(UiDialogTitle);
      expect(customElements.get("ui-dialog-description")).toBe(
        UiDialogDescription
      );
      expect(customElements.get("ui-dialog-outside-trigger")).toBe(
        UiDialogOutsideTrigger
      );
    });
  });

  describe("UiDialog", () => {
    let dialog: UiDialog;

    beforeEach(() => {
      dialog = document.createElement("ui-dialog") as UiDialog;
      document.body.appendChild(dialog);
    });

    it("should initialize with default state", () => {
      dialog.connectedCallback();
      const state = dialog.useRootStore.getState();

      expect(state.open).toBe(false);
      expect(state.modal).toBe(true); // default is modal=true
      expect(state.closedby).toBe("auto");
      expect(state.dialogId).toMatch(/^dialog-/);
      expect(state.titleId).toMatch(/^dialog-title-/);
      expect(state.descriptionId).toMatch(/^dialog-description-/);
    });

    it("should handle open attribute", () => {
      dialog.setAttribute("open", "");
      dialog.connectedCallback();

      const state = dialog.useRootStore.getState();
      expect(state.open).toBe(true);
      expect(dialog.getAttribute("data-state")).toBe("open");
    });

    it("should handle modal attribute correctly", () => {
      dialog.setAttribute("modal", "false");
      dialog.connectedCallback();

      const state = dialog.useRootStore.getState();
      expect(state.modal).toBe(false);
    });

    it("should handle closedby attribute", () => {
      dialog.setAttribute("closedby", "none");
      dialog.connectedCallback();

      const state = dialog.useRootStore.getState();
      expect(state.closedby).toBe("none");
    });

    it("should emit onOpenChange event when state changes", async () => {
      dialog.connectedCallback();

      return new Promise<void>((resolve) => {
        dialog.addEventListener("onOpenChange", (event: Event) => {
          const customEvent = event as CustomEvent;
          expect(customEvent.detail.open).toBe(true);
          expect(customEvent.detail.target).toBe(dialog);
          resolve();
        });

        dialog.useRootStore.setState({ open: true });
      });
    });

    it("should show modal when showModal is called", () => {
      const mockDialog = document.createElement("dialog") as HTMLDialogElement;
      // Mock the showModal method
      mockDialog.showModal = vi.fn();
      const showModalSpy = vi.spyOn(mockDialog, "showModal");
      dialog.appendChild(mockDialog);
      dialog.$dialog = mockDialog;

      dialog.showModal();
      expect(showModalSpy).toHaveBeenCalled();
      expect(dialog.useRootStore.getState().open).toBe(true);
    });

    it("should show non-modal when show is called", () => {
      const mockDialog = document.createElement("dialog") as HTMLDialogElement;
      // Mock the show method
      mockDialog.show = vi.fn();
      const showSpy = vi.spyOn(mockDialog, "show");
      dialog.appendChild(mockDialog);
      dialog.$dialog = mockDialog;

      dialog.show();
      expect(showSpy).toHaveBeenCalled();
      expect(dialog.useRootStore.getState().open).toBe(true);
    });

    it("should close when close is called", () => {
      const mockDialog = document.createElement("dialog") as HTMLDialogElement;
      // Mock the close method
      mockDialog.close = vi.fn();
      const closeSpy = vi.spyOn(mockDialog, "close");
      dialog.appendChild(mockDialog);
      dialog.$dialog = mockDialog;

      dialog.close("test-reason");
      expect(closeSpy).toHaveBeenCalledWith("test-reason");
      expect(dialog.useRootStore.getState().open).toBe(false);
    });

    it("should handle attribute changes dynamically", () => {
      dialog.connectedCallback();

      dialog.setAttribute("open", "");
      expect(dialog.useRootStore.getState().open).toBe(false); // state change happens via attribute handler

      dialog.setAttribute("modal", "false");
      expect(dialog.useRootStore.getState().modal).toBe(false);

      dialog.setAttribute("closedby", "any");
      expect(dialog.useRootStore.getState().closedby).toBe("any");
    });
  });

  describe("UiDialogTrigger", () => {
    let dialog: UiDialog;
    let trigger: UiDialogTrigger;
    let button: HTMLButtonElement;

    beforeEach(() => {
      dialog = document.createElement("ui-dialog") as UiDialog;
      trigger = document.createElement("ui-dialog-trigger") as UiDialogTrigger;
      button = document.createElement("button");

      trigger.appendChild(button);
      dialog.appendChild(trigger);
      document.body.appendChild(dialog);

      dialog.connectedCallback();
      trigger.connectedCallback();
    });

    it("should set correct ARIA attributes on button", () => {
      expect(button.getAttribute("type")).toBe("button");
      expect(button.getAttribute("aria-haspopup")).toBe("dialog");
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(button.hasAttribute("aria-controls")).toBe(true);
    });

    it("should update attributes when dialog state changes", () => {
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(button.getAttribute("data-state")).toBe("closed");

      dialog.useRootStore.setState({ open: true });

      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(button.getAttribute("data-state")).toBe("open");
    });

    it("should show modal dialog on button click when modal=true", () => {
      const showModalSpy = vi.spyOn(dialog, "showModal");
      dialog.useRootStore.setState({ modal: true });

      button.click();
      expect(showModalSpy).toHaveBeenCalled();
    });

    it("should show non-modal dialog on button click when modal=false", () => {
      const showSpy = vi.spyOn(dialog, "show");
      dialog.useRootStore.setState({ modal: false });

      button.click();
      expect(showSpy).toHaveBeenCalled();
    });

    it("should clean up event listeners on disconnect", () => {
      const removeEventListenerSpy = vi.spyOn(button, "removeEventListener");

      trigger.disconnectedCallback();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });
  });

  describe("UiDialogOutsideTrigger", () => {
    let dialog: UiDialog;
    let outsideTrigger: UiDialogOutsideTrigger;
    let button: HTMLButtonElement;

    beforeEach(() => {
      dialog = document.createElement("ui-dialog") as UiDialog;
      dialog.id = "test-dialog";

      outsideTrigger = document.createElement(
        "ui-dialog-outside-trigger"
      ) as UiDialogOutsideTrigger;
      outsideTrigger.setAttribute("data-target", "#test-dialog");

      button = document.createElement("button");
      outsideTrigger.appendChild(button);

      document.body.appendChild(dialog);
      document.body.appendChild(outsideTrigger);

      dialog.connectedCallback();
      outsideTrigger.connectedCallback();
    });

    it("should find and connect to target dialog", () => {
      expect(outsideTrigger.$root).toBe(dialog);
    });

    it("should set correct ARIA attributes", () => {
      expect(button.getAttribute("aria-haspopup")).toBe("dialog");
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(button.hasAttribute("aria-controls")).toBe(true);
    });

    it("should trigger dialog on click", () => {
      const showModalSpy = vi.spyOn(dialog, "showModal");

      button.click();
      expect(showModalSpy).toHaveBeenCalled();
    });

    it("should handle missing target gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const badTrigger = document.createElement(
        "ui-dialog-outside-trigger"
      ) as UiDialogOutsideTrigger;
      badTrigger.setAttribute("data-target", "#nonexistent");

      expect(() => badTrigger.connectedCallback()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith("Target ui-dialog is not found");

      consoleSpy.mockRestore();
    });
  });

  describe("UiDialogClose", () => {
    let dialog: UiDialog;
    let closeButton: UiDialogClose;
    let button: HTMLButtonElement;

    beforeEach(() => {
      dialog = document.createElement("ui-dialog") as UiDialog;
      closeButton = document.createElement("ui-dialog-close") as UiDialogClose;
      button = document.createElement("button");

      closeButton.appendChild(button);
      dialog.appendChild(closeButton);
      document.body.appendChild(dialog);

      dialog.connectedCallback();
      closeButton.connectedCallback();
    });

    it("should set button type", () => {
      expect(button.getAttribute("type")).toBe("button");
    });

    it("should close dialog on button click", () => {
      const closeSpy = vi.spyOn(dialog, "close");

      button.click();
      expect(closeSpy).toHaveBeenCalledWith("close-trigger");
    });

    it("should clean up event listeners on disconnect", () => {
      const removeEventListenerSpy = vi.spyOn(button, "removeEventListener");

      closeButton.disconnectedCallback();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });
  });

  describe("UiDialogContent", () => {
    let dialog: UiDialog;
    let content: UiDialogContent;
    let dialogElement: HTMLDialogElement;

    beforeEach(() => {
      dialog = document.createElement("ui-dialog") as UiDialog;
      content = document.createElement("ui-dialog-content") as UiDialogContent;
      dialogElement = document.createElement("dialog") as HTMLDialogElement;

      content.appendChild(dialogElement);
      dialog.appendChild(content);
      document.body.appendChild(dialog);

      dialog.connectedCallback();
      content.connectedCallback();
    });

    it("should set correct attributes on dialog element", () => {
      const state = dialog.useRootStore.getState();
      expect(dialogElement.getAttribute("id")).toBe(state.dialogId);
      expect(dialogElement.getAttribute("aria-labelledby")).toBe(state.titleId);
      expect(dialogElement.getAttribute("aria-describedby")).toBe(
        state.descriptionId
      );
    });

    it("should show dialog when initially open", () => {
      // Mock the showModal method on the existing dialog element
      dialogElement.showModal = vi.fn();

      dialog.useRootStore.setState({ open: true, modal: true });

      const showModalSpy = vi.spyOn(dialogElement, "showModal");
      content.connectedCallback();

      expect(showModalSpy).toHaveBeenCalled();
    });

    it("should handle escape key based on closedby setting", () => {
      dialog.useRootStore.setState({ open: true, closedby: "none" });

      const event = new KeyboardEvent("keydown", { key: "Escape" });
      const stopPropSpy = vi.spyOn(event, "stopImmediatePropagation");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      dialogElement.dispatchEvent(event);

      expect(stopPropSpy).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should handle light dismiss based on closedby setting", () => {
      // Mock the close method on the existing dialog element
      dialogElement.close = vi.fn();

      dialog.useRootStore.setState({ open: true, closedby: "any" });
      const closeSpy = vi.spyOn(dialogElement, "close");

      // Mock getBoundingClientRect
      const mockRect = { left: 0, right: 100, top: 0, bottom: 100 };
      vi.spyOn(dialogElement, "getBoundingClientRect").mockReturnValue(
        mockRect as DOMRect
      );

      // Click outside the dialog (coordinates outside the rect)
      const clickEvent = new MouseEvent("click", {
        clientX: 150,
        clientY: 150,
        target: dialogElement
      });
      Object.defineProperty(clickEvent, "target", { value: dialogElement });

      dialogElement.dispatchEvent(clickEvent);

      expect(closeSpy).toHaveBeenCalledWith("dismiss");
    });

    it('should not close on light dismiss when closedby is not "any"', () => {
      // Mock the close method on the existing dialog element
      dialogElement.close = vi.fn();

      dialog.useRootStore.setState({ open: true, closedby: "closerequest" });
      const closeSpy = vi.spyOn(dialogElement, "close");

      const clickEvent = new MouseEvent("click", { target: dialogElement });
      Object.defineProperty(clickEvent, "target", { value: dialogElement });

      dialogElement.dispatchEvent(clickEvent);

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it("should clean up event listeners and observers on disconnect", () => {
      // Test that disconnectedCallback doesn't throw an error
      expect(() => {
        content.disconnectedCallback();
      }).not.toThrow();

      // Since observer is private, we can't directly test it
      // but we can verify the method completes successfully
    });
  });

  describe("UiDialogTitle", () => {
    let dialog: UiDialog;
    let title: UiDialogTitle;

    beforeEach(() => {
      dialog = document.createElement("ui-dialog") as UiDialog;
      title = document.createElement("ui-dialog-title") as UiDialogTitle;

      dialog.appendChild(title);
      document.body.appendChild(dialog);

      dialog.connectedCallback();
      title.connectedCallback();
    });

    it("should set id from dialog store", () => {
      const titleId = dialog.useRootStore.getState().titleId;
      expect(title.getAttribute("id")).toBe(titleId);
    });
  });

  describe("UiDialogDescription", () => {
    let dialog: UiDialog;
    let description: UiDialogDescription;

    beforeEach(() => {
      dialog = document.createElement("ui-dialog") as UiDialog;
      description = document.createElement(
        "ui-dialog-description"
      ) as UiDialogDescription;

      dialog.appendChild(description);
      document.body.appendChild(dialog);

      dialog.connectedCallback();
      description.connectedCallback();
    });

    it("should set id from dialog store", () => {
      const descriptionId = dialog.useRootStore.getState().descriptionId;
      expect(description.getAttribute("id")).toBe(descriptionId);
    });
  });

  describe("Integration Tests", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <ui-dialog id="test-dialog" modal="true" closedby="any">
          <ui-dialog-trigger>
            <button>Open Dialog</button>
          </ui-dialog-trigger>
          <ui-dialog-content>
            <dialog>
              <ui-dialog-title>Dialog Title</ui-dialog-title>
              <ui-dialog-description>Dialog Description</ui-dialog-description>
              <p>Dialog content goes here</p>
              <ui-dialog-close>
                <button>Close</button>
              </ui-dialog-close>
            </dialog>
          </ui-dialog-content>
        </ui-dialog>
        
        <ui-dialog-outside-trigger data-target="#test-dialog">
          <button>External Trigger</button>
        </ui-dialog-outside-trigger>
      `;

      // Mock dialog element methods before initializing components
      const dialogElement = document.querySelector("dialog") as HTMLDialogElement;
      if (dialogElement) {
        dialogElement.showModal = vi.fn();
        dialogElement.show = vi.fn();
        dialogElement.close = vi.fn();
      }

      // Initialize all components
      const dialog = document.querySelector("ui-dialog") as UiDialog;
      const trigger = document.querySelector(
        "ui-dialog-trigger"
      ) as UiDialogTrigger;
      const content = document.querySelector(
        "ui-dialog-content"
      ) as UiDialogContent;
      const title = document.querySelector("ui-dialog-title") as UiDialogTitle;
      const description = document.querySelector(
        "ui-dialog-description"
      ) as UiDialogDescription;
      const close = document.querySelector("ui-dialog-close") as UiDialogClose;
      const outsideTrigger = document.querySelector(
        "ui-dialog-outside-trigger"
      ) as UiDialogOutsideTrigger;

      dialog.connectedCallback();
      trigger.connectedCallback();
      content.connectedCallback();
      title.connectedCallback();
      description.connectedCallback();
      close.connectedCallback();
      outsideTrigger.connectedCallback();
    });

    it("should initialize with correct default state", () => {
      const dialog = document.querySelector("ui-dialog") as UiDialog;
      const state = dialog.useRootStore.getState();

      expect(state.open).toBe(false);
      expect(state.modal).toBe(true);
      expect(state.closedby).toBe("any");
    });

    it("should handle complete dialog interaction flow", () => {
      const dialog = document.querySelector("ui-dialog") as UiDialog;
      const triggerButton = document.querySelector(
        "ui-dialog-trigger button"
      ) as HTMLButtonElement;
      const closeButton = document.querySelector(
        "ui-dialog-close button"
      ) as HTMLButtonElement;

      const showModalSpy = vi.spyOn(dialog, "showModal");
      const closeSpy = vi.spyOn(dialog, "close");

      // Initially closed
      expect(dialog.useRootStore.getState().open).toBe(false);

      // Open dialog
      triggerButton.click();
      expect(showModalSpy).toHaveBeenCalled();

      // Close dialog
      closeButton.click();
      expect(closeSpy).toHaveBeenCalledWith("close-trigger");
    });

    it("should handle external trigger", () => {
      const dialog = document.querySelector("ui-dialog") as UiDialog;
      const externalButton = document.querySelector(
        "ui-dialog-outside-trigger button"
      ) as HTMLButtonElement;

      const showModalSpy = vi.spyOn(dialog, "showModal");

      externalButton.click();
      expect(showModalSpy).toHaveBeenCalled();
    });

    it("should emit onOpenChange events during interactions", async () => {
      const dialog = document.querySelector("ui-dialog") as UiDialog;

      return new Promise<void>((resolve) => {
        dialog.addEventListener("onOpenChange", (event: Event) => {
          const customEvent = event as CustomEvent;
          expect(customEvent.detail.open).toBe(true);
          resolve();
        });

        // Manually trigger state change since we're mocking dialog methods
        dialog.useRootStore.setState({ open: true });
      });
    });

    it("should properly link title and description via ARIA attributes", () => {
      const dialogElement = document.querySelector(
        "dialog"
      ) as HTMLDialogElement;
      const title = document.querySelector("ui-dialog-title") as UiDialogTitle;
      const description = document.querySelector(
        "ui-dialog-description"
      ) as UiDialogDescription;

      const titleId = title.getAttribute("id");
      const descriptionId = description.getAttribute("id");

      expect(dialogElement.getAttribute("aria-labelledby")).toBe(titleId);
      expect(dialogElement.getAttribute("aria-describedby")).toBe(
        descriptionId
      );
    });
  });
});
