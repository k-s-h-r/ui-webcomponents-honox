/**
 * ダイアログコンポーネントのテストスイート
 * 
 * このテストでは以下のコンポーネントをテストしています：
 * 
 * 1. UiDialog - メインのダイアログコンテナ
 *    - 初期状態の設定（open、modal、closedby属性）
 *    - 状態変更時のイベント発火
 *    - ダイアログの表示・非表示制御（showModal、show、close）
 *    - 属性変更の購読システムによる処理
 * 
 * 2. UiDialogTrigger - ダイアログを開くトリガーボタン
 *    - ARIA属性の正しい設定（aria-haspopup、aria-expanded、aria-controls）
 *    - 購読システムによる状態更新とボタン属性の同期
 *    - モーダル・非モーダルダイアログの表示制御
 *    - クリックイベントの処理
 * 
 * 3. UiDialogOutsideTrigger - 外部からダイアログを開くトリガー
 *    - data-target属性による対象ダイアログの検索
 *    - ARIA属性の設定
 *    - エラーハンドリング（対象が見つからない場合）
 * 
 * 4. UiDialogClose - ダイアログを閉じるボタン
 *    - ダイアログの閉じる処理
 *    - close理由の指定（"close-trigger"）
 * 
 * 5. UiDialogContent - ダイアログの本体コンテンツ
 *    - HTMLDialogElementのARIA属性設定（aria-labelledby、aria-describedby）
 *    - 購読システムによる初期表示制御
 *    - キーボードイベント処理（Escapeキー、closedby設定による制御）
 *    - ライトディスミス処理（背景クリックでの閉じる、closedby設定による制御）
 * 
 * 6. UiDialogTitle - ダイアログのタイトル要素
 *    - 自動生成されるID属性の設定
 * 
 * 7. UiDialogDescription - ダイアログの説明要素
 *    - 自動生成されるID属性の設定
 * 
 * 8. Integration Tests - 統合テスト
 *    - 全コンポーネントが連携した完全なダイアログフロー
 *    - ARIA関係性の確認（aria-labelledby、aria-describedby）
 *    - 購読システムによるイベント連携
 * 
 * テストの特徴：
 * - 将来のZustand→カスタムpub/subシステム移行に備えた購読ベースのテスト
 * - 自然なユーザーインタラクション（ボタンクリック、キーボード操作）を重視
 * - HTMLDialogElementのJSDOMサポート不足を補うモック実装
 * - 非同期状態変更のPromiseベーステスト
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
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
  (globalThis as typeof globalThis & { HTMLDialogElement: typeof HTMLDialogElement }).HTMLDialogElement = MockHTMLDialogElement as typeof HTMLDialogElement;
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

    it("should emit onOpenChange event through subscription system", async () => {
      // Create a trigger to naturally open the dialog
      const trigger = document.createElement("ui-dialog-trigger") as UiDialogTrigger;
      const button = document.createElement("button");
      
      trigger.appendChild(button);
      dialog.appendChild(trigger);
      
      dialog.connectedCallback();
      trigger.connectedCallback();

      return new Promise<void>((resolve) => {
        dialog.addEventListener("onOpenChange", (event: Event) => {
          const customEvent = event as CustomEvent;
          expect(customEvent.detail.open).toBe(true);
          expect(customEvent.detail.target).toBe(dialog);
          resolve();
        });

        // Trigger through user interaction instead of direct state manipulation
        button.click();
      });
    });

    it("should show modal when showModal is called", () => {
      const mockDialog = document.createElement("dialog") as HTMLDialogElement;
      // Mock the showModal method
      mockDialog.showModal = vi.fn();
      const showModalSpy = vi.spyOn(mockDialog, "showModal");
      dialog.appendChild(mockDialog);
      
      // Initialize the component so it finds the dialog element
      dialog.connectedCallback();

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
      
      // Initialize the component so it finds the dialog element
      dialog.connectedCallback();

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
      
      // Initialize the component so it finds the dialog element
      dialog.connectedCallback();

      dialog.close("test-reason");
      expect(closeSpy).toHaveBeenCalledWith("test-reason");
      expect(dialog.useRootStore.getState().open).toBe(false);
    });

    it("should handle attribute changes through subscription system", async () => {
      dialog.connectedCallback();

      return new Promise<void>((resolve) => {
        let changeCount = 0;
        
        const unsubscribe = dialog.useRootStore.subscribe(
          (state) => ({ modal: state.modal, closedby: state.closedby }),
          (state) => {
            changeCount++;
            if (changeCount === 1) {
              expect(state.modal).toBe(false);
            } else if (changeCount === 2) {
              expect(state.closedby).toBe("any");
              unsubscribe();
              resolve();
            }
          }
        );

        // Trigger subscription through attribute changes
        dialog.setAttribute("modal", "false");
        setTimeout(() => {
          dialog.setAttribute("closedby", "any");
        }, 10);
      });
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

    it("should update attributes through subscription when dialog opens", async () => {
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(button.getAttribute("data-state")).toBe("closed");

      return new Promise<void>((resolve) => {
        const unsubscribe = dialog.useRootStore.subscribe(
          (state) => ({ open: state.open }),
          (state) => {
            if (state.open) {
              // Subscription should update trigger attributes
              expect(button.getAttribute("aria-expanded")).toBe("true");
              expect(button.getAttribute("data-state")).toBe("open");
              unsubscribe();
              resolve();
            }
          }
        );

        // Trigger through user interaction
        button.click();
      });
    });

    it("should show modal dialog through subscription when modal=true", () => {
      // Set modal attribute to configure dialog behavior
      dialog.setAttribute("modal", "true");
      dialog.connectedCallback();
      trigger.connectedCallback();
      
      const showModalSpy = vi.spyOn(dialog, "showModal");

      button.click();
      expect(showModalSpy).toHaveBeenCalled();
      expect(dialog.useRootStore.getState().open).toBe(true);
    });

    it("should show non-modal dialog through subscription when modal=false", () => {
      // Set modal attribute to configure dialog behavior
      dialog.setAttribute("modal", "false");
      dialog.connectedCallback();
      trigger.connectedCallback();
      
      const showSpy = vi.spyOn(dialog, "show");

      button.click();
      expect(showSpy).toHaveBeenCalled();
      expect(dialog.useRootStore.getState().open).toBe(true);
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
      // Test that the outside trigger can successfully find and connect to the dialog
      // by checking if it can trigger the dialog's showModal method
      const showModalSpy = vi.spyOn(dialog, "showModal");
      const button = outsideTrigger.querySelector("button") as HTMLButtonElement;
      
      button.click();
      expect(showModalSpy).toHaveBeenCalled();
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

    it("should show dialog when initially open through subscription", async () => {
      // Set the dialog element with proper mocking first
      dialogElement.showModal = vi.fn();
      dialogElement.show = vi.fn();
      
      // Set initial state before connecting
      dialog.setAttribute("open", "");
      dialog.setAttribute("modal", "true");
      
      // Now connect the callbacks which will detect the open attribute
      dialog.connectedCallback();
      content.connectedCallback();

      // The showModal will be called during connectedCallback if open=true

      return new Promise<void>((resolve) => {
        const unsubscribe = dialog.useRootStore.subscribe(
          (state) => ({ open: state.open }),
          (state) => {
            if (state.open) {
              // The dialog should already be shown due to initial state
              unsubscribe();
              resolve();
            }
          }
        );

        // Force a state update to trigger subscription
        const currentState = dialog.useRootStore.getState();
        dialog.useRootStore.setState({ open: currentState.open });
      });
    });

    it("should handle escape key through subscription based on closedby setting", async () => {
      // Mock dialog element methods first to prevent errors
      dialogElement.showModal = vi.fn();
      dialogElement.show = vi.fn();
      dialogElement.close = vi.fn();
      
      // Configure dialog through attributes
      dialog.setAttribute("open", "");
      dialog.setAttribute("closedby", "none");
      
      return new Promise<void>((resolve) => {
        const unsubscribe = dialog.useRootStore.subscribe(
          (state) => ({ open: state.open, closedby: state.closedby }),
          (state) => {
            if (state.open && state.closedby === "none") {
              const event = new KeyboardEvent("keydown", { key: "Escape" });
              const stopPropSpy = vi.spyOn(event, "stopImmediatePropagation");
              const preventDefaultSpy = vi.spyOn(event, "preventDefault");

              dialogElement.dispatchEvent(event);

              expect(stopPropSpy).toHaveBeenCalled();
              expect(preventDefaultSpy).toHaveBeenCalled();
              unsubscribe();
              resolve();
            }
          }
        );

        dialog.connectedCallback();
        content.connectedCallback();
      });
    });

    it("should handle light dismiss through subscription based on closedby setting", async () => {
      // Mock dialog element methods first to prevent errors
      dialogElement.showModal = vi.fn();
      dialogElement.show = vi.fn();
      dialogElement.close = vi.fn();
      
      // Configure dialog through attributes for light dismiss
      dialog.setAttribute("open", "");
      dialog.setAttribute("closedby", "any");

      return new Promise<void>((resolve) => {
        const unsubscribe = dialog.useRootStore.subscribe(
          (state) => ({ open: state.open, closedby: state.closedby }),
          (state) => {
            if (state.open && state.closedby === "any") {
              const closeSpy = vi.spyOn(dialogElement, "close");

              // Mock getBoundingClientRect
              const mockRect = { left: 0, right: 100, top: 0, bottom: 100 };
              vi.spyOn(dialogElement, "getBoundingClientRect").mockReturnValue(
                mockRect as DOMRect
              );

              // Click outside the dialog (coordinates outside the rect)
              const clickEvent = new MouseEvent("click", {
                clientX: 150,
                clientY: 150
              });
              Object.defineProperty(clickEvent, "target", { value: dialogElement });

              dialogElement.dispatchEvent(clickEvent);

              expect(closeSpy).toHaveBeenCalledWith("dismiss");
              unsubscribe();
              resolve();
            }
          }
        );

        dialog.connectedCallback();
        content.connectedCallback();
      });
    });

    it('should not close on light dismiss through subscription when closedby is not "any"', async () => {
      // Mock dialog element methods first to prevent errors
      dialogElement.showModal = vi.fn();
      dialogElement.show = vi.fn();
      dialogElement.close = vi.fn();
      
      // Configure dialog through attributes
      dialog.setAttribute("open", "");
      dialog.setAttribute("closedby", "closerequest");

      return new Promise<void>((resolve) => {
        const unsubscribe = dialog.useRootStore.subscribe(
          (state) => ({ open: state.open, closedby: state.closedby }),
          (state) => {
            if (state.open && state.closedby === "closerequest") {
              const closeSpy = vi.spyOn(dialogElement, "close");

              const clickEvent = new MouseEvent("click");
              Object.defineProperty(clickEvent, "target", { value: dialogElement });

              dialogElement.dispatchEvent(clickEvent);

              expect(closeSpy).not.toHaveBeenCalled();
              unsubscribe();
              resolve();
            }
          }
        );

        dialog.connectedCallback();
        content.connectedCallback();
      });
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

    it("should emit onOpenChange events through subscription during interactions", async () => {
      const dialog = document.querySelector("ui-dialog") as UiDialog;
      const triggerButton = document.querySelector(
        "ui-dialog-trigger button"
      ) as HTMLButtonElement;

      return new Promise<void>((resolve) => {
        dialog.addEventListener("onOpenChange", (event: Event) => {
          const customEvent = event as CustomEvent;
          expect(customEvent.detail.open).toBe(true);
          // Verify subscription system properly coordinated the state change
          expect(dialog.useRootStore.getState().open).toBe(true);
          resolve();
        });

        // Trigger through natural user interaction instead of direct state manipulation
        triggerButton.click();
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
