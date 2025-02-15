import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { removeAttrCloak, setAttrsElement } from "../utils";

export type AccordionMode = "single" | "multiple";
type AccordionValue = string | string[] | null;

interface AccordionStoreState {
  value: AccordionValue;
  mode: AccordionMode;
  collapsible: boolean;
  disabled: boolean;
  items: UiAccordionItem[];
  removeItems: (itemToRemove: UiAccordionItem) => void;
  addItems: (newItems: UiAccordionItem[]) => void;
}

interface AccordionItemStoreState {
  isOpen: boolean;
  value: string | null;
  disabled: boolean;
}

export class UiAccordion extends HTMLElement {
  private isReady = false;
  unsubscribe: (() => void) | undefined = undefined;
  useRootStore = createStore(
    subscribeWithSelector<AccordionStoreState>((set) => ({
      value: [],
      mode: "multiple",
      collapsible: false,
      disabled: false,
      items: [],
      removeItems: (itemToRemove) =>
        set((state) => ({
          items: state.items.filter((item) => item !== itemToRemove)
        })),
      addItems: (newItems) =>
        set((state) => ({
          items: [...state.items, ...newItems]
        }))
    }))
  );

  static get observedAttributes() {
    return ["disabled", "value", "mode", "collapsible"];
  }

  connectedCallback(): void {
    const mode =
      (this.getAttribute("mode") as AccordionMode) ||
      this.useRootStore.getState().mode;
    const attrValue = this.getAttribute("value") || null;
    const defaultValue =
      mode === "single"
        ? attrValue
        : attrValue?.split(",").map((item) => item.trim()) || null;

    // 初期状態を store に反映
    this.useRootStore.setState({
      value: defaultValue,
      mode: mode,
      collapsible: this.hasAttribute("collapsible"),
      disabled: this.hasAttribute("disabled"),
      items: []
    });

    this.unsubscribe = this.useRootStore.subscribe(
      (state) => ({
        value: state.value
      }),
      (state) => {
        // valueの更新時、onValueChangeイベントを発行
        this.dispatchEvent(
          new CustomEvent("onValueChange", {
            detail: {
              value: state.value
            }
          })
        );
      }
    );

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) this.unsubscribe();
    this.useRootStore.setState({ items: [] });
  }

  attributeChangedCallback(
    property: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    // connectedCallback前にも実行されるためisReadyを確認
    if (!this.isReady) return;

    // attribute [disabled] の変更を store に反映
    if (property === "disabled" && oldValue !== newValue) {
      const isDisabled = newValue !== null;
      this.useRootStore.setState({ disabled: isDisabled });
    }
    // attribute [value] の変更を store に反映
    if (property === "value" && oldValue !== newValue) {
      // singleモードの場合はstring型、multipleモードの場合はstring[]型
      if (this.useRootStore.getState().mode === "single") {
        this.useRootStore.setState({ value: newValue });
      } else {
        const newValues = newValue?.split(",").map((item) => item.trim()) || [];
        this.useRootStore.setState({ value: newValues });
      }
    }
    // attribute [mode] の変更を store に反映
    if (property === "mode" && oldValue !== newValue) {
      const isValid = newValue === "single" || newValue === "multiple";
      if (isValid) {
        this.useRootStore.setState({ mode: newValue });
      }
    }
    // attribute [collapsible] の変更を store に反映
    if (property === "collapsible" && oldValue !== newValue) {
      this.useRootStore.setState({
        collapsible: newValue !== null
      });
    }
  }

  // 開いているUiAccordionItemのvalueを取得
  private getAccordionValue(): AccordionValue {
    const { mode, items } = this.useRootStore.getState();

    // singleモードの場合はstring型、multipleモードの場合はstring[]型
    if (mode === "single") {
      const openItem = items.find(
        (item) => item.useItemStore.getState().isOpen
      );
      return openItem ? openItem.useItemStore.getState().value : null;
    }
    const openValues = items
      .filter((item) => item.useItemStore.getState().isOpen)
      .map((item) => item.useItemStore.getState().value)
      .filter((item) => item !== null);
    return openValues.length ? openValues : null;
  }

  // UiAccordionのvalueを更新し、onValueChangeイベントを発行（UiAccordionItemから実行される）
  updateToggledItems() {
    const newValue = this.getAccordionValue();

    this.useRootStore.setState({
      value: newValue
    });

    setAttrsElement(this, {
      value: Array.isArray(newValue)
        ? newValue.join(",")
        : newValue || undefined
    });
  }
}

export class UiAccordionItem extends HTMLElement {
  private isReady = false;
  private $root: UiAccordion | null = null;
  useItemStore = createStore(
    subscribeWithSelector<AccordionItemStoreState>((set) => ({
      value: null,
      isOpen: false,
      disabled: false
    }))
  );
  unsubscribe: (() => void) | undefined = undefined;
  unsubscribeRoot: (() => void) | undefined = undefined;

  static get observedAttributes() {
    return ["disabled"];
  }

  connectedCallback(): void {
    this.$root = this.closest("ui-accordion");
    if (!this.$root) {
      console.error("ui-accordion-item must be child of ui-accordion");
      return;
    }

    const rootState = this.$root.useRootStore.getState();
    const attrValue = this.getAttribute("value") || null;
    // rootのdisabledを優先
    const disabled =
      rootState.disabled ||
      this.hasAttribute("disabled") ||
      this.useItemStore.getState().disabled;

    const isDefaultOpenSingle =
      attrValue !== null && rootState.value === attrValue;
    const isDefaultOpenMultiple = !!rootState.value?.includes(attrValue || "");
    const isDefaultOpen =
      rootState.mode === "single" ? isDefaultOpenSingle : isDefaultOpenMultiple;

    this.useItemStore.setState({
      value: attrValue,
      isOpen: isDefaultOpen,
      disabled: disabled
    });

    // store から disabledとisOpenを伝播
    this.unsubscribe = this.useItemStore.subscribe(
      (state) => ({
        disabled: state.disabled,
        isOpen: state.isOpen
      }),
      (state) => {
        setAttrsElement(this, {
          "data-state": state.isOpen ? "open" : "closed",
          "data-disabled": state.disabled ? "" : undefined
        });
      }
    );

    // root store から disabledとvalueを伝播
    this.unsubscribeRoot = this.$root.useRootStore.subscribe(
      (state) => ({
        disabled: state.disabled,
        value: state.value
      }),
      (state, oldState) => {
        if (oldState.disabled !== state.disabled) {
          // rootのdisabled 状態を UiAccordionItem で受け取り
          const isItemDisabled = this.hasAttribute("disabled");
          this.useItemStore.setState({
            disabled: state.disabled || isItemDisabled
          });
        }

        if (state.value !== oldState.value) {
          // rootのvalue を UiAccordionItem で受け取り
          // UiAccordionItemのvalueがnullの場合（valueを持っていない場合）は更新しない
          const { value, isOpen } = this.useItemStore.getState();
          if (value === null) return;

          const setOpen = Array.isArray(state.value)
            ? !!state.value.find((item) => item === value)
            : state.value === value;

          if (setOpen !== isOpen) {
            this.toggle(setOpen);
          }
        }
      }
    );

    // UiAccordionItem を root store に反映
    this.$root.useRootStore.getState().addItems([this]);

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeRoot) this.unsubscribeRoot();
    this.$root?.useRootStore.getState().removeItems(this);
  }

  attributeChangedCallback(
    property: string,
    oldValue: string,
    newValue: string
  ) {
    if (!this.isReady) return;

    if (property === "disabled" && oldValue !== newValue) {
      const isDisabled = newValue !== null;
      // rootのdisabledがtrueの場合のみdisabledを更新
      if (this.$root?.useRootStore.getState().disabled) {
        this.useItemStore.setState({ disabled: isDisabled });
      }
    }
  }

  toggle(_setOpen?: boolean): void {
    if (this.$root) {
      const { collapsible, items, mode } = this.$root.useRootStore.getState();
      const setOpen = _setOpen ?? !this.useItemStore.getState().isOpen;

      // collapsible が false の場合、setOpen = false は無視する
      if (!collapsible && !setOpen && mode === "single") return;

      this.useItemStore.setState({ isOpen: setOpen });

      // modeがsingleの場合、開いたアイテム以外を閉じる
      if (mode === "single" && setOpen) {
        const filteredItems = items.filter(
          (item) => item !== this && item.useItemStore.getState().isOpen
        );
        for (const item of filteredItems) {
          item.useItemStore.setState({ isOpen: false });
        }
      }

      // root store に反映（ui-accordionのvalue属性が更新される）
      this.$root.updateToggledItems();
    }
  }

  open(): void {
    this.toggle(true);
  }

  close(): void {
    this.toggle(false);
  }
}

export class UiAccordionTrigger extends HTMLElement {
  private isReady = false;
  private $parentItem: UiAccordionItem | null = null;
  private $button: HTMLButtonElement | null = null;
  private unsubscribe: (() => void) | undefined = undefined;

  connectedCallback(): void {
    this.$parentItem = this.closest("ui-accordion-item");
    if (!this.$parentItem) {
      console.error("ui-accordion-trigger must be child of ui-accordion-item");
      return;
    }

    this.$button = this.querySelector("button:not(:scope ui-accordion *)");
    const $content = this.$parentItem.querySelector(
      "ui-accordion-content:not(:scope ui-accordion *)"
    );
    const triggerId =
      this.$button?.id ||
      `accordion-trigger-${Math.random().toString(36).slice(2)}`;
    const contentId =
      $content?.id ||
      `accordion-content-${Math.random().toString(36).slice(2)}`;
    const { isOpen, disabled } = this.$parentItem.useItemStore.getState();

    this.updateAttrs(isOpen, disabled, triggerId, contentId);
    this.unsubscribe = this.$parentItem.useItemStore.subscribe((state) => {
      this.updateAttrs(state.isOpen, state.disabled, triggerId, contentId);
    });
    this.$button?.addEventListener("click", this.handleClick);

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) this.unsubscribe();
    this.$button?.removeEventListener("click", this.handleClick);
  }

  private updateAttrs(
    isOpen: boolean | undefined,
    isDisabled: boolean | undefined,
    triggerId: string,
    contentId: string
  ): void {
    setAttrsElement(this, {
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": isDisabled ? "" : undefined
    });
    setAttrsElement(this.$button, {
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": isDisabled ? "" : undefined,
      disabled: isDisabled ? "" : undefined,
      "aria-expanded": isOpen ? "true" : "false",
      "aria-controls": contentId,
      type: "button",
      id: triggerId
    });
  }

  private handleClick = (): void => {
    this.$parentItem?.toggle();
  };
}

export class UiAccordionHeader extends HTMLElement {
  private isReady = false;
  private $parentItem: UiAccordionItem | null = null;
  private unsubscribe: (() => void) | undefined = undefined;

  connectedCallback(): void {
    this.$parentItem = this.closest("ui-accordion-item");
    if (!this.$parentItem) {
      console.error("ui-accordion-trigger must be child of ui-accordion-item");
      return;
    }

    const level = "3";
    const role = this.getAttribute("role");
    if (!role) {
      this.setAttribute("role", "heading");
    }
    if (this.getAttribute("role") === "heading") {
      const ariaLevel =
        this.getAttribute("level") || this.getAttribute("aria-level") || level;
      this.setAttribute("aria-level", ariaLevel);
    }

    const { isOpen, disabled } = this.$parentItem.useItemStore.getState();
    this.updateAttrs(isOpen, disabled);

    this.unsubscribe = this.$parentItem.useItemStore.subscribe((state) => {
      this.updateAttrs(state.isOpen, state.disabled);
    });

    removeAttrCloak(this);
    this.isReady = true;
  }
  disconnectedCallback(): void {
    if (this.unsubscribe) this.unsubscribe();
  }
  private updateAttrs(
    isOpen: boolean | undefined,
    isDisabled: boolean | undefined
  ): void {
    setAttrsElement(this, {
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": isDisabled ? "" : undefined
    });
  }
}

export class UiAccordionContent extends HTMLElement {
  private isReady = false;
  private $parentItem: UiAccordionItem | null = null;
  private unsubscribe: (() => void) | undefined = undefined;

  connectedCallback(): void {
    this.$parentItem = this.closest("ui-accordion-item");
    if (!this.$parentItem) {
      console.error("ui-accordion-trigger must be child of ui-accordion-item");
      return;
    }

    const { isOpen, disabled } = this.$parentItem.useItemStore.getState();
    const $button = this.$parentItem.querySelector(
      "ui-accordion-trigger button"
    );
    const triggerId = $button?.id;
    const contentId =
      this.id ||
      $button?.getAttribute("aria-controls") ||
      `accordion-content-${Math.random().toString(36).slice(2)}`;
    let isTransitioning = false;

    this.updateAttrs(isOpen, disabled, triggerId, contentId);

    const handleTransitionRun = () => {
      this.removeEventListener("transitionrun", handleTransitionRun);
      isTransitioning = true;
    };
    const handleTransitionEnd = () => {
      this.removeEventListener("transitionend", handleTransitionEnd);
      isTransitioning = false;

      this.removeAttribute("data-ending-style");
      this.style.removeProperty("--accordion-content-height");

      if (this.$parentItem) {
        // transition中にopen, closeが切り替わるためUiAccordionItemの状態を確認
        const { isOpen, disabled } = this.$parentItem.useItemStore.getState();
        if (!isOpen) {
          // close
          this.updateAttrs(false, disabled, triggerId, contentId);
        }
      }
    };
    this.unsubscribe = this.$parentItem.useItemStore.subscribe((state) => {
      // transitionの有無を確認
      const hasTransition =
        window.getComputedStyle(this).transitionDuration !== "0s";

      if (!hasTransition) {
        // transitionなしならシンプルに開閉のみ
        this.updateAttrs(state.isOpen, state.disabled, triggerId, contentId);
        return;
      }

      if (isTransitioning) {
        // transition中
        this.removeAttribute("data-ending-style");

        if (state.isOpen) {
          // open状態に変更
          this.updateAttrs(true, state.disabled, triggerId, contentId);
          // アニメーションのための準備
          this.style.setProperty(
            "--accordion-content-height",
            `${this.scrollHeight}px`
          );
        } else {
          // アニメーションのための準備
          this.style.setProperty("--accordion-content-height", "0px");
        }
      } else {
        // transition中ではない時
        this.style.removeProperty("--accordion-content-height");

        if (state.isOpen) {
          // open状態に変更
          this.updateAttrs(true, state.disabled, triggerId, contentId);
          // アニメーションのための準備
          this.setAttribute("data-starting-style", "");
          this.removeAttribute("data-ending-style");
          this.style.setProperty(
            "--accordion-content-height",
            `${this.scrollHeight}px`
          );

          this.addEventListener("transitionrun", handleTransitionRun);
          this.addEventListener("transitionend", handleTransitionEnd);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // アニメーション開始
              this.removeAttribute("data-starting-style");
            });
          });
        } else {
          // close状態に変更
          // アニメーションのための準備
          this.style.setProperty(
            "--accordion-content-height",
            `${this.scrollHeight}px`
          );

          this.addEventListener("transitionrun", handleTransitionRun);
          this.addEventListener("transitionend", handleTransitionEnd);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // アニメーション開始
              this.setAttribute("data-ending-style", "");
            });
          });
        }
      }
    });

    removeAttrCloak(this);
    this.isReady = true;
  }
  disconnectedCallback(): void {
    if (this.unsubscribe) this.unsubscribe();
  }

  private updateAttrs(
    isOpen: boolean | undefined,
    isDisabled: boolean | undefined,
    triggerId: string | undefined,
    contentId: string | undefined
  ): void {
    setAttrsElement(this, {
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": isDisabled ? "" : undefined,
      hidden: !isOpen ? "until-found" : undefined,
      role: "region",
      "aria-labelledby": triggerId,
      id: contentId || undefined
    });
  }
}

customElements.define("ui-accordion", UiAccordion);
customElements.define("ui-accordion-item", UiAccordionItem);
customElements.define("ui-accordion-header", UiAccordionHeader);
customElements.define("ui-accordion-trigger", UiAccordionTrigger);
customElements.define("ui-accordion-content", UiAccordionContent);

declare global {
  interface HTMLElementTagNameMap {
    "ui-accordion": UiAccordion;
    "ui-accordion-item": UiAccordionItem;
    "ui-accordion-header": UiAccordionHeader;
    "ui-accordion-trigger": UiAccordionTrigger;
    "ui-accordion-content": UiAccordionContent;
  }
}
