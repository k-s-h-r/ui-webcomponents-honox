import { css } from "hono/css";
import { useState } from "hono/jsx";
import Button from "../_components/ui/button";
import { cn } from "../lib/utils";

export default function AccordionComponents() {
  const [accordion, setAccordion] = useState(["Accordion", "Accordion"]);
  const [multipleMode, setMultipleMode] = useState(true);
  const [collapsibleMode, setCollapsibleMode] = useState(false);

  return (
    <div class="grid gap-4">
      <div class="grid gap-2">
        <h3>Settings</h3>
        <div>
          <Button onClick={() => setMultipleMode((mode) => !mode)}>
            Change: AccordionMode: {multipleMode ? "multiple" : "single"}
          </Button>
        </div>
        <div>
          <Button onClick={() => setCollapsibleMode((mode) => !mode)}>
            Change: Collapsible(only single mode):{" "}
            {collapsibleMode ? "true" : "false"}
          </Button>
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
            mode={multipleMode ? "multiple" : "single"}
            collapsible={collapsibleMode ? "" : undefined}
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
                <ui-accordion-content>
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
              <ui-accordion-content>
                <pre>
                  <code class="rounded-xl bg-gray-800 text-white block p-4 text-sm">
                    {`<ui-accordion mode="${multipleMode ? "multiple" : "single"}"${collapsibleMode ? " collapsible" : ""}>
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
