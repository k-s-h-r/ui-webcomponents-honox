import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { removeAttrCloak, setAttrsElement } from "../utils";

const activateModes = ["manual", "automatic"] as const;
export type ActivationMode = (typeof activateModes)[number];
type TabsValue = string | string[] | null;
interface TabsStoreState {
  value: TabsValue;
  activationMode: ActivationMode;
  tabs: {
    value: string;
    tabId: string;
    panelId: string;
  }[];
}

export class UiTabs extends HTMLElement {
  private isReady = false;
  unsubscribe: (() => void) | undefined = undefined;
  useRootStore = createStore(
    subscribeWithSelector<TabsStoreState>((set) => ({
      value: "",
      activationMode: "automatic",
      tabs: []
    }))
  );

  static get observedAttributes() {
    return ["value", "activationMode"];
  }

  connectedCallback(): void {
    const getDefaultValue = () => {
      const attrValue = this.getAttribute("value");
      if (attrValue !== null) {
        return attrValue;
      }
      // デフォルト値がない場合、aria-selected="true" のタブを探す
      const selectedTrigger = this.querySelector(
        'ui-tabs-trinnger button[aria-selected="true"]'
      );
      if (selectedTrigger) {
        const value = (selectedTrigger as HTMLElement).dataset.uiValue;
        if (value) {
          return value;
        }
      }
      return "";
    };
    const getActivationMode = () => {
      const mode = this.getAttribute("activationMode");
      if (activateModes.includes(mode as ActivationMode)) {
        return this.getAttribute("activationMode") as ActivationMode;
      }
      return this.useRootStore.getState().activationMode;
    };

    // 初期状態を store に反映
    this.useRootStore.setState({
      value: getDefaultValue(),
      activationMode: getActivationMode()
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

  disconnectedCallback(): void {}
}

export class UiTabsList extends HTMLElement {
  private isReady = false;
  private $root: UiTabs | null = null;
  loop = false;

  static get observedAttributes() {
    return ["loop"];
  }

  connectedCallback(): void {
    this.$root = this.closest("ui-tabs");
    if (!this.$root) {
      console.error("ui-tabs-list must be child of ui-tabs");
      return;
    }

    this.loop = this.hasAttribute("loop");
    this.setAttribute("role", "tablist");
    this.addEventListener("keydown", this.handleButtonKeydown);

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {
    this.removeEventListener("keydown", this.handleButtonKeydown);
  }

  attributeChangedCallback(
    property: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    // loop属性の取得
    if (property === "loop" && newValue !== oldValue) {
      this.loop = this.hasAttribute("loop");
    }
  }

  private getTabTriggers = (value: TabsValue) => {
    // disabled以外のトリガーを取得
    const triggerElements = this.querySelectorAll(
      "ui-tabs-trigger:not(:scope ui-tabs *):not([disabled])"
    );
    const triggers = Array.from(triggerElements) as UiTabsTrigger[];
    const currentIndex = triggers.findIndex(
      (trigger) => trigger.value === value
    );
    let nextIndex: number | null = currentIndex + 1;
    let prevIndex: number | null = currentIndex - 1;

    // loop属性を有効にした場合、最後のタブを最初のタブに戻す
    if (this.loop) {
      nextIndex = nextIndex % triggers.length;
      prevIndex = (prevIndex + triggers.length) % triggers.length;
    } else {
      // 次、前タブがなければnullになりhandleButtonKeydownの処理でなにもしない
      if (nextIndex >= triggers.length) nextIndex = null; // currentIndex
      if (prevIndex < 0) prevIndex = null; // currentIndex
    }

    return {
      first: triggers[0],
      last: triggers[triggers.length - 1],
      next: nextIndex === null ? null : triggers[nextIndex],
      prev: prevIndex === null ? null : triggers[prevIndex]
    };
  };

  private handleButtonKeydown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLButtonElement;
    if (!this.$root) return;

    const { value } = this.$root.useRootStore.getState();
    const { first, last, next, prev } = this.getTabTriggers(value);
    let nextTrigger: UiTabsTrigger | null = null;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        nextTrigger = prev;
        break;
      case "ArrowRight":
      case "ArrowDown":
        nextTrigger = next;
        break;
      case "Home":
        nextTrigger = first;
        break;
      case "End":
        nextTrigger = last;
        break;
    }

    if (nextTrigger) {
      event.stopPropagation();
      event.preventDefault();
      nextTrigger.querySelector("button")?.focus();
      this.$root.useRootStore.setState({ value: nextTrigger.value });
    }
  };
}

export class UiTabsTrigger extends HTMLElement {
  private isReady = false;
  private $root: UiTabs | null = null;
  private $button: HTMLButtonElement | null = null;
  private unsubscribe: (() => void) | undefined = undefined;
  value = "";
  disabled = false;

  connectedCallback(): void {
    this.$root = this.closest("ui-tabs");
    if (!this.$root) {
      console.error("ui-tabs-list must be child of ui-tabs");
      return;
    }

    this.$button = this.querySelector("button:not(:scope ui-tabs *)");
    this.value = this.getAttribute("value") || "";
    this.disabled = this.hasAttribute("disabled");
    const tabId =
      this.$button?.id || `tabs-trigger-${Math.random().toString(36).slice(2)}`;
    const isSelected = this.$root.useRootStore.getState().value === this.value;

    // TODO: tabId, panelIdの処理は整理したい
    // tabsの更新（UiTabsTriggerとUiTabsPanelでどちらが先に動作するかわからないため連携して設定）
    const { tabs } = this.$root.useRootStore.getState();
    const tab = tabs.find((tab) => tab.value === this.value);
    if (!tab) {
      // stateがなければstateの新規作成(panelIdはUiTabsPanelで設定)
      const newTabs = [...tabs, { value: this.value, tabId, panelId: "" }];
      this.$root.useRootStore.setState({
        tabs: newTabs
      });
    } else {
      // stateがあればtabIdを設定してstateの更新
      const newTabs = tabs.map((tab) => {
        if (tab.value === this.value) {
          tab.tabId = tabId;
        }
        return tab;
      });
      this.$root.useRootStore.setState({
        tabs: newTabs
      });
    }

    // 初期設定時はtabIdは空(設定はsubscribe処理内で行われる)
    this.updateAttrs(isSelected, this.disabled, tabId, "");

    this.unsubscribe = this.$root.useRootStore.subscribe(
      (state) => ({
        value: state.value,
        tabs: state.tabs
      }),
      (state) => {
        const tab = state.tabs.find((tab) => tab.value === this.value);
        if (!tab) return;
        this.updateAttrs(
          state.value === this.value,
          this.disabled,
          tab.tabId,
          tab.panelId
        );
      }
    );

    this.$button?.addEventListener("click", this.handleClick);

    removeAttrCloak(this);
    this.isReady = true;
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) this.unsubscribe();
    this.$button?.removeEventListener("click", this.handleClick);
  }

  private updateAttrs(
    isSelected: boolean | undefined,
    isDisabled: boolean,
    triggerId: string,
    panelId: string
  ): void {
    setAttrsElement(this, {
      "data-state": isSelected ? "active" : "inactive",
      "data-disabled": isDisabled ? "" : undefined
    });
    setAttrsElement(this.$button, {
      "data-state": isSelected ? "active" : "inactive",
      "data-disabled": isDisabled ? "" : undefined,
      "aria-selected": isSelected ? "true" : "false",
      disabled: isDisabled ? "" : undefined,
      role: "tab",
      "aria-controls": panelId,
      id: triggerId,
      tabindex: isSelected ? "0" : " -1"
    });
  }

  private handleClick = (): void => {
    this.$root?.useRootStore.setState({ value: this.value });
  };
}

export class UiTabsPanel extends HTMLElement {
  private isReady = false;
  private $root: UiTabs | null = null;
  value = "";
  unsubscribe: (() => void) | undefined = undefined;

  connectedCallback(): void {
    this.$root = this.closest("ui-tabs");
    if (!this.$root) {
      console.error("ui-tabs-panel must be child of ui-tabs");
      return;
    }

    this.value = this.getAttribute("value") || "";
    const panelId =
      this.id || `tabs-panel-${Math.random().toString(36).slice(2)}`;

    setAttrsElement(this, {
      role: "tabpanel",
      tabindex: "0",
      "data-state": "inactive",
      id: panelId,
      "aria-labelledby": "" // aria-labelledby(triggerId)の設定はsubscribe処理内で行われる
    });

    // tabsの更新（UiTabsTriggerとUiTabsPanelでどちらが先に動作するかわからないため連携して設定）
    const { tabs } = this.$root.useRootStore.getState();
    const tab = tabs.find((tab) => tab.value === this.value);
    if (!tab) {
      // stateがなければstateの新規作成（tabIdはUiTabsTriggerで設定）
      const newTabs = [...tabs, { value: this.value, tabId: "", panelId }];
      this.$root.useRootStore.setState({
        tabs: newTabs
      });
    } else {
      // stateがあればpanelIdを設定してstateの更新
      const newTabs = tabs.map((tab) => {
        if (tab.value === this.value) {
          tab.panelId = panelId;
        }
        return tab;
      });
      this.$root.useRootStore.setState({
        tabs: newTabs
      });
    }

    this.unsubscribe = this.$root.useRootStore.subscribe(
      (state) => ({
        value: state.value,
        tabs: state.tabs
      }),
      (state) => {
        const tab = state.tabs.find((tab) => tab.value === this.value);
        if (!tab) return;
        setAttrsElement(this, {
          "data-state": state.value === this.value ? "active" : "inactive",
          "aria-labelledby": tab.tabId
        });
      }
    );

    removeAttrCloak(this);
    this.isReady = true;
  }
  disconnectedCallback(): void {
    if (this.unsubscribe) this.unsubscribe();
  }
}

customElements.define("ui-tabs", UiTabs);
customElements.define("ui-tabs-list", UiTabsList);
customElements.define("ui-tabs-trigger", UiTabsTrigger);
customElements.define("ui-tabs-panel", UiTabsPanel);

declare global {
  interface HTMLElementTagNameMap {
    "ui-tabs": UiTabs;
    "ui-tabs-list": UiTabsList;
    "ui-tabs-trigger": UiTabsTrigger;
    "ui-tabs-panel": UiTabsPanel;
  }
}
