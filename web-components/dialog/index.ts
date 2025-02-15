import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { removeAttrCloak, setAttrsElement } from "../utils";

export type DialogClosedby = "any" | "closerequest" | "none";
export type DialogClosedbyDefault = "auto";

const getClosedby = (
  value: string | null
): DialogClosedby | DialogClosedbyDefault => {
  if (value === "any" || value === "closerequest" || value === "none") {
    return value as DialogClosedby;
  }
  return "auto";
};

interface DialogStoreState {
  open: boolean;
  modal: boolean;
  closedby: DialogClosedby | DialogClosedbyDefault;
  dialogId: string;
  titleId: string;
  descriptionId: string;
}

export class UiDialog extends HTMLElement {
  private isReady = false;
  private $dialog: HTMLDialogElement | null = null;

  unsubscribe: (() => void) | undefined = undefined;
  useRootStore = createStore(
    subscribeWithSelector<DialogStoreState>((set) => ({
      open: false,
      modal: false,
      closedby: "auto",
      dialogId: `dialog-${Math.random().toString(36).slice(2)}`,
      titleId: `dialog-title-${Math.random().toString(36).slice(2)}`,
      descriptionId: `dialog-description-${Math.random().toString(36).slice(2)}`
    }))
  );

  static get observedAttributes() {
    return ["open", "modal", "closedby"];
  }

  connectedCallback(): void {
    const open = this.hasAttribute("open");
    const modal = this.getAttribute("modal") !== "false"; // 'false'の場合のみfalse
    const closedby = getClosedby(this.getAttribute("closedby"));
    const $title = this.querySelector(
      "ui-dialog-title:not(:scope ui-dialog *)"
    );
    const $description = this.querySelector(
      "ui-dialog-description:not(:scope ui-dialog *)"
    );
    this.$dialog = this.querySelector("dialog:not(:scope ui-dialog *)");
    const dialogId =
      this.$dialog?.getAttribute("id") ?? this.useRootStore.getState().dialogId;
    const titleId =
      $title?.getAttribute("id") ?? this.useRootStore.getState().titleId;
    const descriptionId =
      $description?.getAttribute("id") ??
      this.useRootStore.getState().descriptionId;

    // 初期状態を store に反映
    this.useRootStore.setState({
      open,
      modal,
      closedby,
      dialogId,
      titleId,
      descriptionId
    });

    // data-state設定
    setAttrsElement(this, {
      "data-state": open ? "open" : "closed"
    });

    this.unsubscribe = this.useRootStore.subscribe(
      (state) => state.open,
      (open) => {
        setAttrsElement(this, {
          "data-state": open ? "open" : "closed"
        });
        // 外部に通知するカスタムイベントを発火
        this.dispatchEvent(
          new CustomEvent("onOpenChange", {
            detail: { open: open, target: this }
          })
        );
      }
    );

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {}

  attributeChangedCallback(
    property: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (property === "open" && newValue !== oldValue) {
      if (newValue === null) {
        this.close();
      } else {
        const { modal } = this.useRootStore.getState();
        if (modal) {
          this.showModal();
        } else {
          this.show();
        }
      }
      this.useRootStore.setState({
        open: newValue === null
      });
    }
    if (property === "modal" && newValue !== oldValue) {
      this.useRootStore.setState({
        modal: this.getAttribute("modal") !== "false" // 'false'の場合のみfalse
      });
    }
    if (property === "closedby" && newValue !== oldValue) {
      this.useRootStore.setState({
        closedby: getClosedby(newValue)
      });
    }
  }

  showModal(): void {
    this.$dialog?.showModal();
    this.useRootStore.setState({
      open: true
    });
  }
  close(string?: string): void {
    this.$dialog?.close(string);
    this.useRootStore.setState({
      open: false
    });
  }
  show(): void {
    this.$dialog?.show();
    this.useRootStore.setState({
      open: true
    });
  }
}

export class UiDialogTrigger extends HTMLElement {
  private isReady = false;
  private $root: UiDialog | null = null;
  private $button: HTMLButtonElement | null = null;

  connectedCallback(): void {
    this.$root = this.closest("ui-dialog");
    if (!this.$root) {
      console.error("ui-dialog-trigger must be child of ui-dialog");
      return;
    }

    this.$button = this.querySelector("button:not(:scope ui-dialog *)");
    const { dialogId, open } = this.$root.useRootStore.getState();

    setAttrsElement(this.$button, {
      type: "button",
      "aria-haspopup": "dialog",
      "aria-expanded": open ? "true" : "false",
      "aria-controls": dialogId,
      "data-state": open ? "open" : "closed"
    });

    this.$button?.addEventListener("click", this.handleClick);

    this.$root.useRootStore.subscribe(
      (state) => state.open,
      (open) => {
        setAttrsElement(this, {
          "data-state": open ? "open" : "closed"
        });
        setAttrsElement(this.$button, {
          "aria-expanded": open ? "true" : "false",
          "data-state": open ? "open" : "closed"
        });
      }
    );

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {
    this.$button?.removeEventListener("click", this.handleClick);
  }

  private handleClick = (): void => {
    if (!this.$root) return;

    const { modal } = this.$root.useRootStore.getState();
    if (modal) {
      this.$root.showModal();
    } else {
      this.$root.show();
    }
  };
}

export class UiDialogOutsideTrigger extends HTMLElement {
  private isReady = false;
  private $root: UiDialog | null = null;
  private $button: HTMLButtonElement | null = null;

  connectedCallback(): void {
    const target = this.getAttribute("data-target") || "";
    const $targetRoot = document.querySelector(target);
    if (!$targetRoot) {
      console.error("Target ui-dialog is not found");
      return;
    }
    if ($targetRoot.tagName !== "UI-DIALOG") {
      console.error("The target is not <ui-dialog>");
      return;
    }
    this.$root = $targetRoot as UiDialog;
    this.$button = this.querySelector("button");
    const { dialogId, open } = this.$root.useRootStore.getState();

    setAttrsElement(this.$button, {
      type: "button",
      "aria-haspopup": "dialog",
      "aria-expanded": open ? "true" : "false",
      "aria-controls": dialogId,
      "data-state": open ? "open" : "closed"
    });

    this.$button?.addEventListener("click", this.handleClick);

    this.$root.useRootStore.subscribe(
      (state) => state.open,
      (open) => {
        setAttrsElement(this, {
          "data-state": open ? "open" : "closed"
        });
        setAttrsElement(this.$button, {
          "aria-expanded": open ? "true" : "false",
          "data-state": open ? "open" : "closed"
        });
      }
    );

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {
    this.$button?.removeEventListener("click", this.handleClick);
  }

  private handleClick = (): void => {
    if (!this.$root) return;

    const { modal } = this.$root.useRootStore.getState();
    if (modal) {
      this.$root.showModal();
    } else {
      this.$root.show();
    }
  };
}

export class UiDialogClose extends HTMLElement {
  private isReady = false;
  private $root: UiDialog | null = null;
  private $button: HTMLButtonElement | null = null;

  connectedCallback(): void {
    this.$root = this.closest("ui-dialog");
    if (!this.$root) {
      console.error("ui-dialog-close must be child of ui-dialog");
      return;
    }

    this.$button = this.querySelector("button:not(:scope ui-dialog *)");

    setAttrsElement(this.$button, {
      type: "button"
    });

    this.$button?.addEventListener("click", this.handleClick);

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {
    this.$button?.removeEventListener("click", this.handleClick);
  }

  private handleClick = (): void => {
    this.$root?.close("close-trigger");
  };
}

export class UiDialogContent extends HTMLElement {
  private isReady = false;
  private $root: UiDialog | null = null;
  private $dialog: HTMLDialogElement | null = null;
  private unsubscribe: (() => void) | undefined = undefined;
  private observer: MutationObserver | null = null;

  connectedCallback(): void {
    this.$root = this.closest("ui-dialog");
    if (!this.$root) {
      console.error("ui-accordion-content must be child of ui-dialog");
      return;
    }
    this.$dialog = this.$root.querySelector("dialog:not(:scope ui-dialog *)");
    if (!this.$dialog || this.$dialog.tagName !== "DIALOG") {
      console.error(
        "<dialog> is required as a child element of ui-dialog-content"
      );
      return;
    }

    const { open, modal, dialogId, titleId, descriptionId } =
      this.$root.useRootStore.getState();

    setAttrsElement(this, {
      "data-state": open ? "open" : "closed"
    });
    setAttrsElement(this.$dialog, {
      id: dialogId,
      "aria-labelledby": titleId,
      "aria-describedby": descriptionId,
      "data-state": open ? "open" : "closed"
    });

    // 初期状態がopenならshowModal()
    if (open) {
      if (modal) {
        this.$dialog?.showModal();
      } else {
        this.$dialog?.show();
      }
    }

    this.unsubscribe = this.$root.useRootStore.subscribe(
      (state) => state.open,
      (open) => {
        if (open) {
          this.$dialog?.addEventListener(
            "keydown",
            this.handleStopPropagationEscape
          );
          this.$dialog?.addEventListener("click", this.handleLightDismiss);
        } else {
          this.$dialog?.removeEventListener(
            "keydown",
            this.handleStopPropagationEscape
          );
          this.$dialog?.removeEventListener("click", this.handleLightDismiss);
        }
        setAttrsElement(this, {
          "data-state": open ? "open" : "closed"
        });
        setAttrsElement(this.$dialog, {
          "data-state": open ? "open" : "closed"
        });
      }
    );

    removeAttrCloak(this);
    this.isReady = true;
  }
  disconnectedCallback(): void {
    if (this.unsubscribe) this.unsubscribe();

    // observerを停止
    this.observer?.disconnect();
    this.observer = null;
  }

  private handleStopPropagationEscape = (event: Event): void => {
    const state = this.$root?.useRootStore.getState();
    // closedby='none'の場合、Escapeキー(Close request)イベントを止める
    // https://html.spec.whatwg.org/#close-request
    if (
      state?.open &&
      state?.closedby === "none" &&
      event instanceof KeyboardEvent &&
      event.key === "Escape"
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };

  private handleLightDismiss = (event: MouseEvent): void => {
    const state = this.$root?.useRootStore.getState();
    const target = event.target as Element;
    // closedby='any'の場合、dialog背景クリックで閉じる
    if (state?.open && state?.closedby === "any" && this.$dialog && target) {
      if (target.nodeName === "DIALOG") {
        const rect = target.getBoundingClientRect();

        // クリック座標 (ビューポート基準)
        const clickX = event.clientX;
        const clickY = event.clientY;

        // 要素内かどうかを判定
        const isInside =
          clickX >= rect.left &&
          clickX <= rect.right &&
          clickY >= rect.top &&
          clickY <= rect.bottom;

        if (!isInside) {
          this.$dialog.close("dismiss");
        }
      }
    }
  };
}

export class UiDialogTitle extends HTMLElement {
  private isReady = false;
  private $root: UiDialog | null = null;
  connectedCallback(): void {
    this.$root = this.closest("ui-dialog");
    if (!this.$root) {
      console.error("ui-accordion-title must be child of ui-dialog-content");
      return;
    }
    const { titleId } = this.$root.useRootStore.getState();
    setAttrsElement(this, {
      id: titleId
    });

    removeAttrCloak(this);
    this.isReady = true;
  }
  disconnectedCallback(): void {}
}
export class UiDialogDescription extends HTMLElement {
  private isReady = false;
  private $root: UiDialog | null = null;
  connectedCallback(): void {
    this.$root = this.closest("ui-dialog");
    if (!this.$root) {
      console.error(
        "ui-accordion-description must be child of ui-dialog-content"
      );
      return;
    }

    const { descriptionId } = this.$root.useRootStore.getState();
    setAttrsElement(this, {
      id: descriptionId
    });

    removeAttrCloak(this);
    this.isReady = true;
  }
  disconnectedCallback(): void {}
}

customElements.define("ui-dialog", UiDialog);
customElements.define("ui-dialog-trigger", UiDialogTrigger);
customElements.define("ui-dialog-close", UiDialogClose);
customElements.define("ui-dialog-content", UiDialogContent);
customElements.define("ui-dialog-title", UiDialogTitle);
customElements.define("ui-dialog-description", UiDialogDescription);
customElements.define("ui-dialog-outside-trigger", UiDialogOutsideTrigger);

declare global {
  interface HTMLElementTagNameMap {
    "ui-dialog": UiDialog;
    "ui-dialog-trigger": UiDialogTrigger;
    "ui-dialog-close": UiDialogClose;
    "ui-dialog-content": UiDialogContent;
    "ui-dialog-title": UiDialogTitle;
    "ui-dialog-description": UiDialogDescription;
    "ui-dialog-outside-trigger": UiDialogOutsideTrigger;
  }
}
