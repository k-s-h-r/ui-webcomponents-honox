import { css } from "hono/css"
import { useState } from "hono/jsx"
import Button from "../_components/ui/button"
import { cn } from "../lib/utils"

export default function DialogComponents() {
  const [loopMode, setLoopMode] = useState(true)
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
  ]

  return (
    <div class="grid gap-4">
      <div class="grid gap-2">
        <h3>Settings</h3>
        <div>
          <Button onClick={() => setLoopMode((loopMode) => !loopMode)}>
            Change: LoopMode: {loopMode ? "true" : "false"}
          </Button>
        </div>
      </div>

      <div class="grid gap-2">
        <h3>Example</h3>

        <div class="p-2 bg-gray-200 rounded-lg">
          <ui-tabs value="Tab1">
            {/* biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole: <explanation> */}
            <ui-tabs-list
              role="tablist"
              loop={loopMode ? "" : undefined}
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
                      "disabled:opacity-50"
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
                <ui-tabs-panel key={item} value={item.value}>
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
              <ui-accordion-content>
                <pre>
                  <code class="rounded-xl bg-gray-800 text-white block p-4 text-sm">
                    {`<ui-tabs>
  <ui-tabs-list${loopMode ? " loop" : ""}>
    <ui-tabs-trigger value="tab1"><button>Tab1</button></ui-tabs-trigger>
    <ui-tabs-trigger value="tab2"><button>Tab2</button></ui-tabs-trigger>
  <ui-tabs-list>
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
  )
}
