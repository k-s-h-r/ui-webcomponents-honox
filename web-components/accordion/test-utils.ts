import type {
  UiAccordion,
  UiAccordionContent,
  UiAccordionHeader,
  UiAccordionItem,
  UiAccordionTrigger
} from "./index";

type SetupOptions = {
  mode?: "single" | "multiple";
  value?: string;
  collapsible?: boolean;
  items?: Array<{ value: string; label?: string; content?: string }>;
};

export function setupAccordion(opts: SetupOptions = {}) {
  const {
    mode = "single",
    value,
    collapsible = false,
    items = [
      { value: "item1", label: "Item 1", content: "Content 1" },
      { value: "item2", label: "Item 2", content: "Content 2" }
    ]
  } = opts;

  const root = document.createElement("ui-accordion") as UiAccordion;
  root.setAttribute("mode", mode);
  if (value) root.setAttribute("value", value);
  if (collapsible) root.setAttribute("collapsible", "");

  const created: UiAccordionItem[] = [];

  for (const it of items) {
    const item = document.createElement("ui-accordion-item") as UiAccordionItem;
    item.setAttribute("value", it.value);

    const header = document.createElement(
      "ui-accordion-header"
    ) as UiAccordionHeader;
    const trigger = document.createElement(
      "ui-accordion-trigger"
    ) as UiAccordionTrigger;
    const btn = document.createElement("button");
    btn.textContent = it.label ?? it.value;
    trigger.appendChild(btn);
    header.appendChild(trigger);

    const content = document.createElement(
      "ui-accordion-content"
    ) as UiAccordionContent;
    content.innerHTML = `<p>${it.content ?? ""}</p>`;

    item.appendChild(header);
    item.appendChild(content);
    root.appendChild(item);
    created.push(item);
  }

  document.body.appendChild(root);

  // Explicitly invoke lifecycle similar to existing tests to be stable in JSDOM
  root.connectedCallback();
  for (const item of created) item.connectedCallback();
  for (const trigger of Array.from(
    root.querySelectorAll("ui-accordion-trigger")
  ))
    (trigger as UiAccordionTrigger).connectedCallback();
  for (const content of Array.from(
    root.querySelectorAll("ui-accordion-content")
  ))
    (content as UiAccordionContent).connectedCallback();
  for (const header of Array.from(root.querySelectorAll("ui-accordion-header")))
    (header as UiAccordionHeader).connectedCallback();

  return { root };
}

export function getParts(root: UiAccordion, value: string) {
  const item = root.querySelector(
    `ui-accordion-item[value="${value}"]`
  ) as UiAccordionItem | null;
  const trigger = item?.querySelector(
    "ui-accordion-trigger"
  ) as UiAccordionTrigger | null;
  const button = item?.querySelector("button") as HTMLButtonElement | null;
  const content = item?.querySelector(
    "ui-accordion-content"
  ) as UiAccordionContent | null;
  const header = item?.querySelector(
    "ui-accordion-header"
  ) as UiAccordionHeader | null;
  return { item, trigger, button, content, header };
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
