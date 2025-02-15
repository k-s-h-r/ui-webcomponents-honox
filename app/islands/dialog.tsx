import { css } from "hono/css";
import { useState } from "hono/jsx";
import Button from "../_components/ui/button";
import { cn } from "../lib/utils";

export default function DialogComponents() {
  const closedbyList = ["any", "closerequest", "none", "undefined"];
  const [modalMode, setModalMode] = useState(true);
  const [closedby, setClosedby] = useState("any");

  return (
    <div class="grid gap-4">
      <div class="grid gap-2">
        <h3>Settings</h3>
        <div>
          <Button onClick={() => setModalMode((modalMode) => !modalMode)}>
            Change: ModalMode: {modalMode ? "true" : "false"}
          </Button>
        </div>
        <div>
          <Button
            onClick={() =>
              setClosedby(
                (closedby) =>
                  closedbyList[
                    (closedbyList.indexOf(closedby) + 1) % closedbyList.length
                  ]
              )
            }
          >
            Change: Closedby: {closedby}
          </Button>
        </div>
      </div>

      <div class="grid gap-2">
        <h3>Example</h3>
        <div class="p-2 bg-gray-200 rounded-lg">
          <ui-dialog
            modal={modalMode ? undefined : "false"}
            closedby={closedby === "undefined" ? undefined : closedby}
          >
            <ui-dialog-trigger>
              <button
                type="button"
                class={cn(
                  "text-left p-2 bg-white rounded not-disabled:cursor-pointer hover:not-disabled:bg-gray-100 border border-gray-300"
                )}
              >
                Open Dialog (ModalMode: {modalMode ? "true" : "false"},
                closedby: {closedby})
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
              <ui-accordion-content cloak>
                <pre>
                  <code class="rounded-xl bg-gray-800 text-white block p-4 text-sm">
                    {`<ui-dialog${modalMode ? "" : ' modal="false"'}${closedby !== "undefined" ? ` closedby="${closedby}"` : ""}>
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
