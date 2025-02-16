import { css } from "hono/css";
import { useState } from "hono/jsx";
import Button from "../_components/ui/button";
import { cn } from "../lib/utils";

export default function AccordionComponents() {
  const [accordion, setAccordion] = useState(["Accordion", "Accordion"]);

  const typeList = ["multiple", "single"];
  const collapsibleList = ["true", "false"];
  const [typeMode, setTypeMode] = useState(typeList[0]);
  const [collapsibleMode, setCollapsibleMode] = useState(collapsibleList[0]);

  const settingsTableClass = cn(
    "border-l border-gray-300 grid grid-cols-subgrid col-span-full",
    "[&>div]:py-2 [&>div]:px-4 [&>div]:border-b [&>div]:border-r [&>div]:border-gray-300"
  );

  return (
    <div class="grid gap-4">
      <div class="grid gap-2">
        <h3>Settings</h3>
        <div class="border-t border-gray-300 grid grid-cols-[max-content_1fr]">
          <div
            role="radiogroup"
            aria-labelledby="dialog-group-1"
            class={cn(settingsTableClass)}
          >
            <div id="dialog-group-1" class="bg-gray-100">
              Attribute: type
            </div>
            <div class="flex gap-0 md:gap-4 flex-col md:flex-row">
              {typeList.map((option) => (
                <label key={option} class="flex gap-1 items-center">
                  <input
                    type="radio"
                    name="type"
                    value={option}
                    checked={typeMode === option}
                    onChange={() => setTypeMode(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="dialog-group-2"
            class={cn(settingsTableClass)}
          >
            <div id="dialog-group-2" class="bg-gray-100">
              Attribute: collapsible <br class="md:hidden" />
              (single mode only)
            </div>
            <div class="flex gap-0 md:gap-4 flex-col md:flex-row">
              {collapsibleList.map((option) => (
                <label key={option} class="flex gap-1 items-center">
                  <input
                    type="radio"
                    name="collapsible"
                    value={option}
                    checked={collapsibleMode === option}
                    onChange={() => setCollapsibleMode(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <div>
            <Button
              onClick={() =>
                setAccordion((accordion) => [...accordion, "Accordion"])
              }
            >
              Add: Accordion
            </Button>
          </div>
          <div>
            <Button
              onClick={() =>
                setAccordion((accordion) => accordion.slice(0, -1))
              }
            >
              Remove: Accordion
            </Button>
          </div>
        </div>
      </div>

      <div class="grid gap-2">
        <h3>Example</h3>

        <div class="p-2 bg-gray-200 rounded-lg">
          <ui-accordion
            mode={typeMode}
            collapsible={collapsibleMode === "true" ? "" : undefined}
            class={cn("grid gap-1")}
          >
            {accordion.map((item, index) => (
              <ui-accordion-item key={item}>
                <ui-accordion-trigger>
                  <button
                    type="button"
                    class={cn(
                      "w-full text-left bg-white p-2 rounded not-disabled:cursor-pointer border border-gray-300",
                      "disabled:opacity-50 hover:not-disabled:bg-gray-100"
                    )}
                  >
                    {item} {index + 1}
                  </button>
                </ui-accordion-trigger>
                <ui-accordion-content cloak>
                  <div class="p-2">
                    {item}
                    {index + 1} content
                  </div>
                </ui-accordion-content>
              </ui-accordion-item>
            ))}
          </ui-accordion>
        </div>
      </div>

      <div class="grid gap-2">
        <div class="grid gap-2">
          <ui-accordion mode="single" collapsible>
            <ui-accordion-item>
              <h3>
                <ui-accordion-trigger>
                  <button
                    type="button"
                    class="mb-2 data-[state=open]:[&_span]:rotate-90"
                  >
                    <span class="inline-block">▶︎</span> Code
                  </button>
                </ui-accordion-trigger>
              </h3>
              <ui-accordion-content cloak class="@container">
                <pre class="max-w-[100cqw] rounded-xl bg-gray-800 text-white block p-4 text-sm overflow-x-auto">
                  <code>
                    {`<ui-accordion mode="${typeMode}"${collapsibleMode === "true" ? " collapsible" : ""}>
  <ui-accordion-item>
    <ui-accordion-trigger>
      <button>Open Accordion item</button>
    </ui-accordion-trigger>
    <ui-accordion-content>
      Accordion content
    </ui-accordion-content>
  </ui-accordion-item>
</ui-accordion>`}
                  </code>
                </pre>
              </ui-accordion-content>
            </ui-accordion-item>
          </ui-accordion>
        </div>
      </div>
    </div>
  );
}
