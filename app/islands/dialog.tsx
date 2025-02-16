import { css } from "hono/css";
import { useState } from "hono/jsx";
import Button from "../_components/ui/button";
import { cn } from "../lib/utils";

export default function DialogComponents() {
  const closedbyList = ["any", "closerequest", "none", "undefined"];
  const modalList = ["true", "false"];
  const [modalMode, setModalMode] = useState(modalList[0]);
  const [closedby, setClosedby] = useState(closedbyList[0]);

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
              Attribute: modal
            </div>
            <div class="flex gap-0 md:gap-4 flex-col md:flex-row">
              {modalList.map((option) => (
                <label key={option} class="flex gap-1 items-center">
                  <input
                    type="radio"
                    name="modal"
                    value={option}
                    checked={modalMode === option}
                    onChange={() => setModalMode(option)}
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
              Attribute: closedby
            </div>
            <div class="flex gap-0 md:gap-4 flex-col md:flex-row">
              {closedbyList.map((option) => (
                <label key={option} class="flex gap-1 items-center">
                  <input
                    type="radio"
                    name="closedby"
                    value={option}
                    checked={closedby === option}
                    onChange={() => setClosedby(option)}
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
          <ui-dialog
            modal={modalMode === "true" ? undefined : "false"}
            closedby={closedby === "undefined" ? undefined : closedby}
          >
            <ui-dialog-trigger>
              <button
                type="button"
                class={cn(
                  "text-left p-2 bg-white rounded not-disabled:cursor-pointer hover:not-disabled:bg-gray-100 border border-gray-300"
                )}
              >
                Open Dialog (ModalMode: {modalMode}, closedby: {closedby})
              </button>
            </ui-dialog-trigger>
            <ui-dialog-content>
              <dialog class={cn("rounded border max-w-120 w-full")}>
                <div class={cn("relatieve p-4 grid gap-4")}>
                  <ui-dialog-close>
                    <button
                      type="button"
                      class={cn("absolute text-sm top-2 right-2")}
                      autofocus
                    >
                      close
                    </button>
                  </ui-dialog-close>
                  <div class="grid gap-2">
                    <ui-dialog-title>
                      <h2 class={cn("text-lg font-bold")}>Dialog Title</h2>
                    </ui-dialog-title>
                    <ui-dialog-description>
                      <p class="text-sm">Dialog description</p>
                    </ui-dialog-description>
                  </div>
                  <p>Dialog content</p>
                </div>
              </dialog>
            </ui-dialog-content>
          </ui-dialog>
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
                    {`<ui-dialog${modalMode === "true" ? "" : ' modal="false"'}${closedby !== "undefined" ? ` closedby="${closedby}"` : ""}>
  <ui-dialog-trigger><button>Open Dialog</button></ui-dialog-trigger>
  <ui-dialog-content>
    <dialog>
      <ui-dialog-close><button autofocus>close</button></ui-dialog-close>
      <ui-dialog-title><h2>Dialog Title</h2></ui-dialog-title>
      <ui-dialog-description><p>Dialog description</p></ui-dialog-description>
      <p>Dialog content</p>
    </dialog>
  </ui-dialog-content>
</ui-dialog>`}
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
