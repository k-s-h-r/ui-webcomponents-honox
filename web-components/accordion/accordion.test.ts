// biome-ignore-all lint/style/noNonNullAssertion

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  UiAccordion,
  UiAccordionContent,
  UiAccordionHeader,
  UiAccordionItem,
  UiAccordionTrigger
} from "./index";
import "./index";
import { getParts, once, setupAccordion } from "./test-utils";

// JP: アコーディオン（簡素版）
describe("Accordion Components (simplified)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  // JP: カスタムエレメントの登録
  describe("Custom Elements", () => {
    // JP: 全てのエレメントが登録されている
    it("registers all elements", () => {
      expect(customElements.get("ui-accordion")).toBe(UiAccordion);
      expect(customElements.get("ui-accordion-item")).toBe(UiAccordionItem);
      expect(customElements.get("ui-accordion-header")).toBe(UiAccordionHeader);
      expect(customElements.get("ui-accordion-trigger")).toBe(
        UiAccordionTrigger
      );
      expect(customElements.get("ui-accordion-content")).toBe(
        UiAccordionContent
      );
    });
  });

  // JP: 初期状態
  describe("Initial State", () => {
    it.each([
      { mode: "single", value: "item1", open: ["item1"] },
      { mode: "multiple", value: "item1,item2", open: ["item1", "item2"] }
    // JP: mode/value 属性の解釈
    ])("parses mode/value: %o", ({ mode, value, open }) => {
      const { root } = setupAccordion({ mode: mode as any, value });
      for (const v of ["item1", "item2"]) {
        const { button } = getParts(root, v);
        const shouldBeOpen = open.includes(v);
        expect(button?.getAttribute("aria-expanded")).toBe(
          shouldBeOpen ? "true" : "false"
        );
      }
    });
  });

  // JP: インタラクション
  describe("Interactions", () => {
    // JP: single は排他で aria-expanded 同期
    it("single: enforces exclusivity and syncs aria-expanded", () => {
      const { root } = setupAccordion({ mode: "single", value: "item1" });
      const b1 = getParts(root, "item1").button!;
      const b2 = getParts(root, "item2").button!;

      expect(b1.getAttribute("aria-expanded")).toBe("true");
      expect(b2.getAttribute("aria-expanded")).toBe("false");

      b2.click();
      expect(b1.getAttribute("aria-expanded")).toBe("false");
      expect(b2.getAttribute("aria-expanded")).toBe("true");

      b1.click();
      expect(b1.getAttribute("aria-expanded")).toBe("true");
      expect(b2.getAttribute("aria-expanded")).toBe("false");
    });

    // JP: multiple は複数同時に開ける
    it("multiple: allows opening multiple items", () => {
      const { root } = setupAccordion({ mode: "multiple" });
      const b1 = getParts(root, "item1").button!;
      const b2 = getParts(root, "item2").button!;

      expect(b1.getAttribute("aria-expanded")).toBe("false");
      expect(b2.getAttribute("aria-expanded")).toBe("false");

      b1.click();
      b2.click();
      expect(b1.getAttribute("aria-expanded")).toBe("true");
      expect(b2.getAttribute("aria-expanded")).toBe("true");
    });

    // JP: single+collapsible で全て閉じられる
    it("single+collapsible: can close the last open item", () => {
      const { root } = setupAccordion({
        mode: "single",
        value: "item1",
        collapsible: true
      });
      const b1 = getParts(root, "item1").button!;

      expect(b1.getAttribute("aria-expanded")).toBe("true");
      b1.click(); // close self
      expect(b1.getAttribute("aria-expanded")).toBe("false");
    });
  });

  // JP: disabled 伝播
  describe("Disabled Propagation", () => {
    // JP: 親が disabled のとき trigger/button も無効
    it("disables triggers/buttons when root is disabled", () => {
      const { root } = setupAccordion();
      root.setAttribute("disabled", "");
      // re-run connectedCallback to apply attributeChangedCallback logic deterministically
      root.connectedCallback();

      const t1 = getParts(root, "item1");
      expect(t1.trigger?.getAttribute("data-disabled")).toBe("");
      expect(t1.button?.getAttribute("data-disabled")).toBe("");
      expect(t1.button?.hasAttribute("disabled")).toBe(true);
    });
  });

  // JP: ARIA 関係
  describe("ARIA Relationships", () => {
    // JP: trigger と content の関連付け
    it("links trigger and content via aria-controls/aria-labelledby", () => {
      const { root } = setupAccordion();
      const { button, content } = getParts(root, "item1");

      const controls = button!.getAttribute("aria-controls");
      const labelledby = content!.getAttribute("aria-labelledby");
      expect(controls).toBeTruthy();
      expect(labelledby).toBe(button!.id);
      expect(content!.id).toBe(controls);
    });
  });

  // JP: イベントと値同期
  describe("Events and Value Sync", () => {
    // JP: single の onValueChange と value 同期
    it("fires onValueChange and syncs value attribute (single)", async () => {
      const { root } = setupAccordion({ mode: "single", value: "item1" });
      const b2 = getParts(root, "item2").button!;

      const p = once<CustomEvent>(root, "onValueChange");
      b2.click();
      const event = await p;

      // event.detail.value for single is string
      expect(typeof event.detail.value === "string").toBe(true);
      expect(root.getAttribute("value")).toBe("item2");
    });

    // JP: multiple の onValueChange は配列
    it("fires onValueChange with array (multiple)", async () => {
      const { root } = setupAccordion({ mode: "multiple" });
      const b1 = getParts(root, "item1").button!;
      const b2 = getParts(root, "item2").button!;

      const p = once<CustomEvent>(root, "onValueChange");
      b1.click();
      const e1 = await p;
      expect(Array.isArray(e1.detail.value)).toBe(true);

      const p2 = once<CustomEvent>(root, "onValueChange");
      b2.click();
      const e2 = await p2;
      expect(Array.isArray(e2.detail.value)).toBe(true);
      expect((e2.detail.value as string[]).sort()).toEqual(["item1", "item2"]);
    });
  });

  // JP: コンテンツのアニメーション（簡易）
  describe("Content Animation (smoke)", () => {
    // JP: open 時に CSS 変数を設定し、終了後にクリーンアップ
    it("applies CSS var on open and cleans up after transition", () => {
      vi.useFakeTimers();
      const { root } = setupAccordion();
      const { content, item } = getParts(root, "item1");

      // closed by default
      expect(content!.getAttribute("hidden")).toBe("until-found");

      Object.defineProperty(content!, "scrollHeight", {
        value: 100,
        configurable: true
      });
      const spy = vi
        .spyOn(window, "getComputedStyle")
        .mockReturnValue({ transitionDuration: "0.3s" } as any);

      // open
      item!.open();
      // flush any nested requestAnimationFrame (mocked via timers)
      vi.runOnlyPendingTimers();
      expect(
        content!.style.getPropertyValue("--accordion-content-height")
      ).toBe("100px");

      // simulate transitionend
      content!.dispatchEvent(new Event("transitionend"));
      vi.runOnlyPendingTimers();
      expect(
        content!.style.getPropertyValue("--accordion-content-height")
      ).toBe("");

      // cleanup spies and subscriptions to avoid leakage across tests
      spy.mockRestore();
      content!.disconnectedCallback();
    });
  });
});
