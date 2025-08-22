import type { UiTabs, UiTabsList, UiTabsPanel, UiTabsTrigger } from "./index";

type TriggerDef = { value: string; label?: string; disabled?: boolean };

type SetupOptions = {
  value?: string;
  activationMode?: "automatic" | "manual";
  loop?: boolean;
  triggers?: TriggerDef[];
};

export function setupTabs(opts: SetupOptions = {}) {
  const {
    value,
    activationMode = "automatic",
    loop = false,
    triggers = [
      { value: "tab1", label: "Tab 1" },
      { value: "tab2", label: "Tab 2" },
      { value: "tab3", label: "Tab 3", disabled: false }
    ]
  } = opts;

  const root = document.createElement("ui-tabs") as UiTabs;
  if (value) root.setAttribute("value", value);
  root.setAttribute("activation-mode", activationMode);

  const list = document.createElement("ui-tabs-list") as UiTabsList;
  if (loop) list.setAttribute("loop", "");

  const createdTriggers: UiTabsTrigger[] = [];
  const createdPanels: UiTabsPanel[] = [];

  for (const t of triggers) {
    const trigger = document.createElement("ui-tabs-trigger") as UiTabsTrigger;
    trigger.setAttribute("value", t.value);
    if (t.disabled) trigger.setAttribute("disabled", "");
    const btn = document.createElement("button");
    btn.textContent = t.label ?? t.value;
    trigger.appendChild(btn);
    list.appendChild(trigger);
    createdTriggers.push(trigger);

    const panel = document.createElement("ui-tabs-panel") as UiTabsPanel;
    panel.setAttribute("value", t.value);
    panel.innerHTML = `<p>Content for ${t.label ?? t.value}</p>`;
    root.appendChild(panel);
    createdPanels.push(panel);
  }

  root.appendChild(list);
  document.body.appendChild(root);

  // lifecycle hookup similar to existing tests
  root.connectedCallback();
  list.connectedCallback();
  for (const tr of createdTriggers) tr.connectedCallback();
  for (const pn of createdPanels) pn.connectedCallback();

  return { root, list };
}

export function getParts(root: UiTabs, value: string) {
  const trigger = root.querySelector(
    `ui-tabs-trigger[value="${value}"]`
  ) as UiTabsTrigger | null;
  const button = trigger?.querySelector("button") as HTMLButtonElement | null;
  const panel = root.querySelector(
    `ui-tabs-panel[value="${value}"]`
  ) as UiTabsPanel | null;
  return { trigger, button, panel };
}

export function once<T extends Event>(el: Element, name: string) {
  return new Promise<T>((resolve) => {
    const handler = (e: Event) => {
      el.removeEventListener(name, handler as EventListener);
      resolve(e as T);
    };
    el.addEventListener(name, handler as EventListener);
  });
}
