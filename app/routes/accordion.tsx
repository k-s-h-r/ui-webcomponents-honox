import { createRoute } from "honox/factory";
import { cn } from "../lib/utils";

export default createRoute((c) => {
  return c.render(
    <div class="grid gap-8">
      <h1 class="text-3xl font-bold">Accordion Gallery</h1>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Single (default)</h2>
        <ui-accordion mode="single" class={cn("grid gap-1")}> 
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">
                Item 1
              </button>
            </ui-accordion-trigger>
            <ui-accordion-content cloak>
              <div class="p-2">Content 1</div>
            </ui-accordion-content>
          </ui-accordion-item>
          <ui-accordion-item value="item2">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">
                Item 2
              </button>
            </ui-accordion-trigger>
            <ui-accordion-content cloak>
              <div class="p-2">Content 2</div>
            </ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Single + collapsible</h2>
        <ui-accordion mode="single" collapsible class={cn("grid gap-1")}>
          <ui-accordion-item value="a">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">A</button>
            </ui-accordion-trigger>
            <ui-accordion-content cloak>
              <div class="p-2">A content</div>
            </ui-accordion-content>
          </ui-accordion-item>
          <ui-accordion-item value="b">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">B</button>
            </ui-accordion-trigger>
            <ui-accordion-content cloak>
              <div class="p-2">B content</div>
            </ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Single with default open (value)</h2>
        <ui-accordion mode="single" value="b" class={cn("grid gap-1")}>
          <ui-accordion-item value="a">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">A</button>
            </ui-accordion-trigger>
            <ui-accordion-content cloak>
              <div class="p-2">A content</div>
            </ui-accordion-content>
          </ui-accordion-item>
          <ui-accordion-item value="b">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">B</button>
            </ui-accordion-trigger>
            <ui-accordion-content>
              <div class="p-2">B content (open by default)</div>
            </ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Multiple</h2>
        <ui-accordion mode="multiple" class={cn("grid gap-1")}>
          <ui-accordion-item value="x">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">X</button>
            </ui-accordion-trigger>
            <ui-accordion-content cloak>
              <div class="p-2">X content</div>
            </ui-accordion-content>
          </ui-accordion-item>
          <ui-accordion-item value="y">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">Y</button>
            </ui-accordion-trigger>
            <ui-accordion-content cloak>
              <div class="p-2">Y content</div>
            </ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Multiple with default opens (value="x,y")</h2>
        <ui-accordion mode="multiple" value="x,y" class={cn("grid gap-1")}>
          <ui-accordion-item value="x">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">X</button>
            </ui-accordion-trigger>
            <ui-accordion-content>
              <div class="p-2">X content (open by default)</div>
            </ui-accordion-content>
          </ui-accordion-item>
          <ui-accordion-item value="y">
            <ui-accordion-trigger>
              <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">Y</button>
            </ui-accordion-trigger>
            <ui-accordion-content>
              <div class="p-2">Y content (open by default)</div>
            </ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      </section>

      <section class="grid gap-3">
        <h2 class="text-xl font-semibold">Disabled root and disabled item</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="grid gap-2">
            <h3 class="font-medium">Root disabled</h3>
            <ui-accordion disabled class={cn("grid gap-1")}>
              <ui-accordion-item value="d1">
                <ui-accordion-trigger>
                  <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">Item</button>
                </ui-accordion-trigger>
                <ui-accordion-content cloak>
                  <div class="p-2">Disabled by root</div>
                </ui-accordion-content>
              </ui-accordion-item>
            </ui-accordion>
          </div>
          <div class="grid gap-2">
            <h3 class="font-medium">Item disabled</h3>
            <ui-accordion class={cn("grid gap-1")}>
              <ui-accordion-item value="d2" disabled>
                <ui-accordion-trigger>
                  <button type="button" class="w-full text-left bg-white p-2 rounded border border-gray-300">Disabled item</button>
                </ui-accordion-trigger>
                <ui-accordion-content cloak>
                  <div class="p-2">This item is disabled</div>
                </ui-accordion-content>
              </ui-accordion-item>
            </ui-accordion>
          </div>
        </div>
      </section>
    </div>,
    { title: "Accordion Gallery" }
  );
});

