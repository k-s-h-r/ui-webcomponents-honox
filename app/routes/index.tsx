import { createRoute } from "honox/factory";
import Accordion from "../islands/accordion";
import Dialog from "../islands/dialog";
import Tabs from "../islands/tabs";

export default createRoute((c) => {
  // const name = c.req.query('name') ?? 'Hono'
  return c.render(
    <div class="grid gap-8">
      <h1 class="text-3xl font-bold">Hello, hono & Web Components!</h1>
      <div class="grid gap-4">
        <h2 class="text-lg font-bold">Dialog Example</h2>
        <Dialog />
      </div>
      <div class="grid gap-4">
        <h2 class="text-lg font-bold">Tabs Example</h2>
        <Tabs />
      </div>
      <div class="grid gap-4">
        <h2 class="text-lg font-bold">Accordion Example</h2>
        <Accordion />
      </div>
    </div>,
    { title: "Hello, hono & Web Components!" }
  );
});
