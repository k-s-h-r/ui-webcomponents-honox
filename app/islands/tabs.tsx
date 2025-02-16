import { css } from "hono/css";
import { useState } from "hono/jsx";
import Button from "../_components/ui/button";
import { cn } from "../lib/utils";

export default function DialogComponents() {
  const loopList = ["true", "false"];
  const [loopMode, setLoopMode] = useState(loopList[0]);
  const tabsList = [
    {
      value: "Tab1"
    },
    {
      value: "Tab2"
    },
    {
      value: "Tab3",
      disabled: true
    },
    {
      value: "Tab4"
    },
    {
      value: "Tab5",
      disabled: true
    }
  ];

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
              Attribute: loop
            </div>
            <div class="flex gap-4">
              {loopList.map((option) => (
                <label key={option} class="flex gap-1 items-center">
                  <input
                    type="radio"
                    name="loop"
                    value={option}
                    checked={loopMode === option}
                    onChange={() => setLoopMode(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-2">
        <h3>Example</h3>

        <div class="p-2 bg-gray-200 rounded-lg">
          <ui-tabs value="Tab1">
            {/* biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole: <explanation> */}
            <ui-tabs-list
              role="tablist"
              loop={loopMode === "true" ? "" : undefined}
              class={cn("flex gap-0.5")}
            >
              {tabsList.map((item, index) => (
                <ui-tabs-trigger
                  key={item}
                  value={item.value}
                  disabled={item.disabled ? "" : undefined}
                >
                  <button
                    type="button"
                    class={cn(
                      "bg-white not-disabled:cursor-pointer hover:not-disabled:bg-gray-200 border border-gray-300 p-2 rounded-t",
                      "disabled:opacity-50",
                      "data-[state=active]:bg-gradient-to-t from-white from-90% to-gray-700 to-90%"
                    )}
                  >
                    {item.value}
                  </button>
                </ui-tabs-trigger>
              ))}
            </ui-tabs-list>
            <div
              class={cn("bg-white border rounded-b border-gray-300 -mt-px p-4")}
            >
              {tabsList.map((item, index) => (
                <ui-tabs-panel
                  key={item}
                  value={item.value}
                  cloak={index === 0 ? "" : undefined}
                  data-state={index === 0 ? "active" : "inactive"}
                >
                  {item.value} content
                </ui-tabs-panel>
              ))}
            </div>
          </ui-tabs>
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
              <ui-accordion-content cloak>
                <pre>
                  <code class="rounded-xl bg-gray-800 text-white block p-4 text-sm">
                    {`<ui-tabs value="tab1">
  <ui-tabs-list${loopMode === "true" ? " loop" : ""}>
    <ui-tabs-trigger value="tab1"><button>Tab1</button></ui-tabs-trigger>
    <ui-tabs-trigger value="tab2"><button>Tab2</button></ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-panel value="tab1">
    Tab1 content
  </ui-tabs-panel>
  <ui-tabs-panel value="tab2">
    Tab2 content
  </ui-tabs-panel>
</ui-tabs>`}
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
