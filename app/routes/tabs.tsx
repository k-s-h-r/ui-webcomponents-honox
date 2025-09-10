import { createRoute } from "honox/factory";
import { cn } from "../lib/utils";

const TabList = ({ loop }: { loop?: boolean }) => (
  <ui-tabs-list role="tablist" class={cn("flex gap-0.5")} loop={loop ? "" : undefined}>
    <ui-tabs-trigger value="Tab1">
      <button type="button" class="bg-white hover:bg-gray-200 border border-gray-300 p-2 rounded-t">
        Tab1
      </button>
    </ui-tabs-trigger>
    <ui-tabs-trigger value="Tab2">
      <button type="button" class="bg-white hover:bg-gray-200 border border-gray-300 p-2 rounded-t">
        Tab2
      </button>
    </ui-tabs-trigger>
    <ui-tabs-trigger value="Tab3">
      <button type="button" class="bg-white hover:bg-gray-200 border border-gray-300 p-2 rounded-t">
        Tab3
      </button>
    </ui-tabs-trigger>
  </ui-tabs-list>
);

export default createRoute((c) => {
  return c.render(
    <div class="grid gap-8">
      <h1 class="text-3xl font-bold">Tabs Gallery</h1>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Basic (value="Tab1")</h2>
        <ui-tabs value="Tab1">
          <TabList />
          <div class="bg-white border rounded-b border-gray-300 -mt-px p-4">
            <ui-tabs-panel value="Tab1">
              Tab1 content
            </ui-tabs-panel>
            <ui-tabs-panel value="Tab2" cloak>
              Tab2 content
            </ui-tabs-panel>
            <ui-tabs-panel value="Tab3" cloak>
              Tab3 content
            </ui-tabs-panel>
          </div>
        </ui-tabs>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">With disabled tab</h2>
        <ui-tabs value="Tab1">
          <ui-tabs-list role="tablist" class={cn("flex gap-0.5")}> 
            <ui-tabs-trigger value="Tab1">
              <button type="button" class="bg-white hover:bg-gray-200 border border-gray-300 p-2 rounded-t">
                Tab1
              </button>
            </ui-tabs-trigger>
            <ui-tabs-trigger value="Tab2" disabled>
              <button type="button" class="bg-white hover:bg-gray-200 border border-gray-300 p-2 rounded-t disabled:opacity-50">
                Tab2 (disabled)
              </button>
            </ui-tabs-trigger>
            <ui-tabs-trigger value="Tab3">
              <button type="button" class="bg-white hover:bg-gray-200 border border-gray-300 p-2 rounded-t">
                Tab3
              </button>
            </ui-tabs-trigger>
          </ui-tabs-list>
          <div class="bg-white border rounded-b border-gray-300 -mt-px p-4">
            <ui-tabs-panel value="Tab1">
              Tab1 content
            </ui-tabs-panel>
            <ui-tabs-panel value="Tab2" cloak>
              Tab2 content
            </ui-tabs-panel>
            <ui-tabs-panel value="Tab3" cloak>
              Tab3 content
            </ui-tabs-panel>
          </div>
        </ui-tabs>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Loop navigation</h2>
        <ui-tabs value="Tab2">
          <TabList loop />
          <div class="bg-white border rounded-b border-gray-300 -mt-px p-4">
            <ui-tabs-panel value="Tab1" cloak>
              Loop example: Tab1 content
            </ui-tabs-panel>
            <ui-tabs-panel value="Tab2">
              Loop example: Tab2 content
            </ui-tabs-panel>
            <ui-tabs-panel value="Tab3" cloak>
              Loop example: Tab3 content
            </ui-tabs-panel>
          </div>
        </ui-tabs>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Activation mode (manual)</h2>
        <p class="text-sm text-gray-600">Keyboard navigation semantics example.</p>
        <ui-tabs value="Tab1" activation-mode="manual">
          <TabList />
          <div class="bg-white border rounded-b border-gray-300 -mt-px p-4">
            <ui-tabs-panel value="Tab1">
              Manual: Tab1
            </ui-tabs-panel>
            <ui-tabs-panel value="Tab2" cloak>
              Manual: Tab2
            </ui-tabs-panel>
            <ui-tabs-panel value="Tab3" cloak>
              Manual: Tab3
            </ui-tabs-panel>
          </div>
        </ui-tabs>
      </section>
    </div>,
    { title: "Tabs Gallery" }
  );
});

