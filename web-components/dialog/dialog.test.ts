// biome-ignore-all lint/style/noNonNullAssertion: allowed
// JP: ダイアログ（簡素版）
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  UiDialog,
  UiDialogClose,
  UiDialogContent,
  UiDialogDescription,
  UiDialogOutsideTrigger,
  UiDialogTitle,
  UiDialogTrigger
} from "./index";
import "./index";
import { getParts, once, setupDialog } from "./test-utils";

// Minimal mock for HTMLDialogElement behavior in JSDOM
class MockHTMLDialogElement extends HTMLElement {
  open = false;
  returnValue = "";
  showModal() {
    this.open = true;
  }
  show() {
    this.open = true;
  }
  close(v?: string) {
    this.open = false;
    if (v) this.returnValue = v;
  }
}

beforeEach(() => {
  (globalThis as any).HTMLDialogElement = MockHTMLDialogElement as any;
});

// JP: ダイアログコンポーネント（簡素版）
describe("Dialog Components (simplified)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  // JP: カスタムエレメントの登録
  describe("Custom Elements", () => {
    // JP: 全てのエレメントが登録されている
    it("registers all elements", () => {
      expect(customElements.get("ui-dialog")).toBe(UiDialog);
      expect(customElements.get("ui-dialog-trigger")).toBe(UiDialogTrigger);
      expect(customElements.get("ui-dialog-close")).toBe(UiDialogClose);
      expect(customElements.get("ui-dialog-content")).toBe(UiDialogContent);
      expect(customElements.get("ui-dialog-title")).toBe(UiDialogTitle);
      expect(customElements.get("ui-dialog-description")).toBe(
        UiDialogDescription
      );
      expect(customElements.get("ui-dialog-outside-trigger")).toBe(
        UiDialogOutsideTrigger
      );
    });
  });

  // JP: 初期状態
  describe("Initial State", () => {
    // JP: 既定は閉じた状態、ARIA の id を接続
    it("closed by default and wires ARIA ids", () => {
      const { root } = setupDialog({ modal: true, closedby: "any" });
      const { dialogEl, title, desc } = getParts(root);
      expect(root.getAttribute("data-state")).toBe("closed");
      // ARIA relationships
      expect(dialogEl!.getAttribute("aria-labelledby")).toBe(title!.id);
      expect(dialogEl!.getAttribute("aria-describedby")).toBe(desc!.id);
    });

    // JP: 接続時に open 属性を尊重（モーダル）
    it("respects open attribute at connect time (modal)", () => {
      const { root } = setupDialog({ open: true, modal: true });
      const { content, dialogEl, triggerBtn } = getParts(root);
      expect(root.getAttribute("data-state")).toBe("open");
      expect(content!.getAttribute("data-state")).toBe("open");
      expect(dialogEl!.getAttribute("data-state")).toBe("open");
      // trigger reflects open state
      expect(triggerBtn!.getAttribute("aria-expanded")).toBe("true");
    });
  });

  // JP: インタラクション
  describe("Interactions", () => {
    // JP: 既定はモーダルとして開く
    it("trigger opens as modal by default", () => {
      const { root } = setupDialog({ modal: true });
      const { triggerBtn } = getParts(root);
      const spy = vi.spyOn(root, "showModal");
      triggerBtn!.click();
      expect(spy).toHaveBeenCalled();
      expect(root.getAttribute("data-state")).toBe("open");
    });

    // JP: modal=false のとき非モーダルで開く
    it("trigger opens as non-modal when modal=false", () => {
      const { root } = setupDialog({ modal: false });
      const { triggerBtn } = getParts(root);
      const spy = vi.spyOn(root, "show");
      triggerBtn!.click();
      expect(spy).toHaveBeenCalled();
      expect(root.getAttribute("data-state")).toBe("open");
    });

    // JP: 外部トリガーで対象ダイアログを開く
    it("outside trigger opens target dialog", () => {
      const { root } = setupDialog({ modal: true, withOutsideTrigger: true });
      const outside = document.querySelector(
        "ui-dialog-outside-trigger"
      ) as UiDialogOutsideTrigger;
      const btn = outside.querySelector("button") as HTMLButtonElement;
      const spy = vi.spyOn(root, "showModal");
      btn.click();
      expect(spy).toHaveBeenCalled();
    });

    // JP: close ボタンで理由付きクローズ
    it("close button closes dialog with reason", () => {
      const { root } = setupDialog({ modal: true });
      const { closeBtn } = getParts(root);
      const spy = vi.spyOn(root, "close");
      closeBtn!.click();
      expect(spy).toHaveBeenCalledWith("close-trigger");
    });
  });

  // JP: ARIA 関係
  describe("ARIA", () => {
    // JP: trigger の ARIA と dialog id の紐付け
    it("trigger button has correct ARIA and links to dialog id", () => {
      const { root } = setupDialog({});
      const { triggerBtn, content, dialogEl } = getParts(root);
      expect(triggerBtn!.getAttribute("aria-haspopup")).toBe("dialog");
      expect(triggerBtn!.getAttribute("aria-expanded")).toBe("false");
      expect(triggerBtn!.getAttribute("aria-controls")).toBe(dialogEl!.id);
      // content reflects closed state
      expect(content!.getAttribute("data-state")).toBe("closed");
    });
  });

  // JP: イベント
  describe("Events", () => {
    // JP: 開くと onOpenChange を発火
    it("emits onOpenChange when opening", async () => {
      const { root } = setupDialog({});
      const { triggerBtn } = getParts(root);
      const p = once<CustomEvent>(root, "onOpenChange");
      triggerBtn!.click();
      const ev = await p;
      expect(ev.detail.open).toBe(true);
      expect(ev.detail.target).toBe(root);
    });
  });
});
