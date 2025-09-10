import { createRoute } from "honox/factory";
import { cn } from "../lib/utils";

export default createRoute((c) => {
  return c.render(
    <div class="grid gap-8">
      <h1 class="text-3xl font-bold">Dialog Gallery</h1>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Modal (default)</h2>
        <ui-dialog>
          <ui-dialog-trigger>
            <button
              type="button"
              class="bg-white border border-gray-300 p-2 rounded"
            >
              Open Modal
            </button>
          </ui-dialog-trigger>
          <ui-dialog-content cloak>
            <dialog class="rounded border p-4">
              <ui-dialog-title>
                <h3 class="text-lg font-semibold">Modal Dialog</h3>
              </ui-dialog-title>
              <ui-dialog-description>
                <p class="text-sm text-gray-600">Default modal behavior.</p>
              </ui-dialog-description>
              <div class="mt-4 flex gap-2">
                <ui-dialog-close>
                  <button
                    type="button"
                    class="border border-gray-300 p-2 rounded"
                  >
                    Close
                  </button>
                </ui-dialog-close>
              </div>
            </dialog>
          </ui-dialog-content>
        </ui-dialog>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Non-modal (modal=false)</h2>
        <ui-dialog modal="false">
          <ui-dialog-trigger>
            <button
              type="button"
              class="bg-white border border-gray-300 p-2 rounded"
            >
              Open Non-modal
            </button>
          </ui-dialog-trigger>
          <ui-dialog-content cloak>
            <dialog class="rounded border p-4 shadow relative">
              <ui-dialog-title>
                <h3 class="text-lg font-semibold">Non-modal Dialog</h3>
              </ui-dialog-title>
              <ui-dialog-description>
                <p class="text-sm text-gray-600">
                  Opens with show() instead of showModal().
                </p>
              </ui-dialog-description>
              <div class="mt-4">
                <ui-dialog-close>
                  <button
                    type="button"
                    class="border border-gray-300 p-2 rounded"
                  >
                    Close
                  </button>
                </ui-dialog-close>
              </div>
            </dialog>
          </ui-dialog-content>
        </ui-dialog>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Open at mount (open)</h2>
        <ui-dialog open modal="false">
          <ui-dialog-trigger>
            <button
              type="button"
              class="bg-white border border-gray-300 p-2 rounded"
            >
              Open
            </button>
          </ui-dialog-trigger>
          <ui-dialog-content>
            <dialog class="rounded border p-4 relative">
              <ui-dialog-title>
                <h3 class="text-lg font-semibold">Initially Open</h3>
              </ui-dialog-title>
              <ui-dialog-description>
                <p class="text-sm text-gray-600">Dialog starts open.</p>
              </ui-dialog-description>
              <div class="mt-4">
                <ui-dialog-close>
                  <button
                    type="button"
                    class="border border-gray-300 p-2 rounded"
                  >
                    Close
                  </button>
                </ui-dialog-close>
              </div>
            </dialog>
          </ui-dialog-content>
        </ui-dialog>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">closedby variants</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <ui-dialog closedby="any">
            <ui-dialog-trigger>
              <button
                type="button"
                class="bg-white border border-gray-300 p-2 rounded w-full"
              >
                closedby="any"
              </button>
            </ui-dialog-trigger>
            <ui-dialog-content cloak>
              <dialog class="rounded border p-4">
                <ui-dialog-title>
                  <h3 class="font-semibold">Light dismiss enabled</h3>
                </ui-dialog-title>
                <ui-dialog-description>
                  <p class="text-sm">Click backdrop to close.</p>
                </ui-dialog-description>
                <ui-dialog-close>
                  <button
                    type="button"
                    class="mt-3 border border-gray-300 p-2 rounded"
                  >
                    Close
                  </button>
                </ui-dialog-close>
              </dialog>
            </ui-dialog-content>
          </ui-dialog>

          <ui-dialog closedby="closerequest">
            <ui-dialog-trigger>
              <button
                type="button"
                class="bg-white border border-gray-300 p-2 rounded w-full"
              >
                closedby="closerequest"
              </button>
            </ui-dialog-trigger>
            <ui-dialog-content cloak>
              <dialog class="rounded border p-4">
                <ui-dialog-title>
                  <h3 class="font-semibold">Close request only</h3>
                </ui-dialog-title>
                <ui-dialog-description>
                  <p class="text-sm">
                    Backdrop/Escape follow default close request.
                  </p>
                </ui-dialog-description>
                <ui-dialog-close>
                  <button
                    type="button"
                    class="mt-3 border border-gray-300 p-2 rounded"
                  >
                    Close
                  </button>
                </ui-dialog-close>
              </dialog>
            </ui-dialog-content>
          </ui-dialog>

          <ui-dialog closedby="none">
            <ui-dialog-trigger>
              <button
                type="button"
                class="bg-white border border-gray-300 p-2 rounded w-full"
              >
                closedby="none"
              </button>
            </ui-dialog-trigger>
            <ui-dialog-content cloak>
              <dialog class="rounded border p-4">
                <ui-dialog-title>
                  <h3 class="font-semibold">No Escape to close</h3>
                </ui-dialog-title>
                <ui-dialog-description>
                  <p class="text-sm">Escape key is ignored.</p>
                </ui-dialog-description>
                <ui-dialog-close>
                  <button
                    type="button"
                    class="mt-3 border border-gray-300 p-2 rounded"
                  >
                    Close
                  </button>
                </ui-dialog-close>
              </dialog>
            </ui-dialog-content>
          </ui-dialog>
        </div>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Outside Trigger</h2>
        <div class="grid gap-2">
          <ui-dialog id="dialog-target">
            <ui-dialog-trigger>
              <button
                type="button"
                class="bg-white border border-gray-300 p-2 rounded"
              >
                Open (internal)
              </button>
            </ui-dialog-trigger>
            <ui-dialog-content cloak>
              <dialog class="rounded border p-4">
                <ui-dialog-title>
                  <h3 class="text-lg font-semibold">Targeted Dialog</h3>
                </ui-dialog-title>
                <ui-dialog-description>
                  <p class="text-sm text-gray-600">Can be opened externally.</p>
                </ui-dialog-description>
                <div class="mt-4">
                  <ui-dialog-close>
                    <button
                      type="button"
                      class="border border-gray-300 p-2 rounded"
                    >
                      Close
                    </button>
                  </ui-dialog-close>
                </div>
              </dialog>
            </ui-dialog-content>
          </ui-dialog>
          <ui-dialog-outside-trigger data-target="#dialog-target">
            <button
              type="button"
              class="bg-white border border-gray-300 p-2 rounded"
            >
              Open (outside trigger)
            </button>
          </ui-dialog-outside-trigger>
        </div>
      </section>
    </div>,
    { title: "Dialog Gallery" }
  );
});
