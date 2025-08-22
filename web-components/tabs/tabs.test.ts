// biome-ignore-all lint/style/noNonNullAssertion
// JP: タブ（簡素版）
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UiTabs, UiTabsList, UiTabsPanel, UiTabsTrigger } from './index'
import './index'
import { getParts, once, setupTabs } from './test-utils'

describe('Tabs Components (simplified)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  // JP: カスタムエレメントの登録
  describe('Custom Elements', () => {
    // JP: 全てのエレメントが登録されている
    it('registers all elements', () => {
      expect(customElements.get('ui-tabs')).toBe(UiTabs)
      expect(customElements.get('ui-tabs-list')).toBe(UiTabsList)
      expect(customElements.get('ui-tabs-trigger')).toBe(UiTabsTrigger)
      expect(customElements.get('ui-tabs-panel')).toBe(UiTabsPanel)
    })
  })

  // JP: 初期状態
  describe('Initial State', () => {
    it.each([
      { activationMode: 'automatic', value: 'tab1' },
      { activationMode: 'manual', value: 'tab2' }
    // JP: activation-mode/value 属性の解釈
    ])('parses attributes: %o', ({ activationMode, value }) => {
      const { root } = setupTabs({ activationMode: activationMode as any, value })
      const b = getParts(root, value).button!
      expect(b.getAttribute('aria-selected')).toBe('true')
    })

    // JP: value が無いとき aria-selected から既定値を検出
    it('detects default value from aria-selected when value is missing', () => {
      const root = document.createElement('ui-tabs') as UiTabs
      const list = document.createElement('ui-tabs-list') as UiTabsList
      const t1 = document.createElement('ui-tabs-trigger') as UiTabsTrigger
      const t2 = document.createElement('ui-tabs-trigger') as UiTabsTrigger
      t1.setAttribute('value', 'tab1')
      t2.setAttribute('value', 'tab2')
      const b1 = document.createElement('button'); b1.dataset.uiValue = 'tab1'
      const b2 = document.createElement('button'); b2.dataset.uiValue = 'tab2'; b2.setAttribute('aria-selected','true')
      t1.appendChild(b1); t2.appendChild(b2)
      list.appendChild(t1); list.appendChild(t2)
      root.appendChild(list)
      document.body.appendChild(root)
      root.connectedCallback(); list.connectedCallback(); t1.connectedCallback(); t2.connectedCallback()
      expect(root.useRootStore.getState().value).toBe('tab2')
    })
  })

  // JP: インタラクション
  describe('Interactions', () => {
    // JP: クリックで切替し aria-selected を更新
    it('click switches tabs and updates aria-selected', () => {
      const { root } = setupTabs({ value: 'tab1' })
      const b1 = getParts(root, 'tab1').button!
      const b2 = getParts(root, 'tab2').button!

      expect(b1.getAttribute('aria-selected')).toBe('true')
      expect(b2.getAttribute('aria-selected')).toBe('false')
      b2.click()
      expect(b1.getAttribute('aria-selected')).toBe('false')
      expect(b2.getAttribute('aria-selected')).toBe('true')
    })

    // JP: キーボード ArrowRight でフォーカスと値を進める
    it('keyboard: ArrowRight moves focus and value', () => {
      const { root, list } = setupTabs({ value: 'tab1' })
      const nextBtn = getParts(root, 'tab2').button!
      const focusSpy = vi.spyOn(nextBtn, 'focus')
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      expect(focusSpy).toHaveBeenCalled()
      expect(nextBtn.getAttribute('aria-selected')).toBe('true')
    })

    // JP: キーボード Home/End で先頭/末尾へ移動
    it('keyboard: Home/End jump to first/last', () => {
      const { root, list } = setupTabs({ value: 'tab2', triggers: [
        { value: 'tab1' }, { value: 'tab2' }, { value: 'tab3' }
      ] })
      const firstBtn = getParts(root, 'tab1').button!
      const lastBtn = getParts(root, 'tab3').button!
      const focusFirst = vi.spyOn(firstBtn, 'focus')
      const focusLast = vi.spyOn(lastBtn, 'focus')

      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }))
      expect(focusFirst).toHaveBeenCalled()
      expect(firstBtn.getAttribute('aria-selected')).toBe('true')

      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
      expect(focusLast).toHaveBeenCalled()
      expect(lastBtn.getAttribute('aria-selected')).toBe('true')
    })

    // JP: ループ有効時は末尾→先頭へ循環
    it('keyboard: loop wraps when enabled', () => {
      const { root, list } = setupTabs({ value: 'tab2', loop: true, triggers: [
        { value: 'tab1' }, { value: 'tab2' }
      ] })
      const firstBtn = getParts(root, 'tab1').button!
      const focusFirst = vi.spyOn(firstBtn, 'focus')
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      expect(focusFirst).toHaveBeenCalled()
      expect(firstBtn.getAttribute('aria-selected')).toBe('true')
    })

    // JP: disabled のタブはスキップ
    it('keyboard: skips disabled tabs', () => {
      const { root, list } = setupTabs({ value: 'tab1', triggers: [
        { value: 'tab1' }, { value: 'tab2', disabled: true }, { value: 'tab3' }
      ] })
      const btn3 = getParts(root, 'tab3').button!
      const focus3 = vi.spyOn(btn3, 'focus')
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      expect(focus3).toHaveBeenCalled()
      expect(btn3.getAttribute('aria-selected')).toBe('true')
    })
  })

  // JP: ARIA 関係
  describe('ARIA', () => {
    // JP: ボタンの aria-controls はパネル id、パネルの aria-labelledby はボタン id
    it('button aria-controls links to panel id; panel aria-labelledby links back', () => {
      const { root } = setupTabs({ value: 'tab1' })
      const { button, panel } = getParts(root, 'tab1')
      const btn = button!
      const pn = panel!

      const controls = btn.getAttribute('aria-controls')
      expect(controls).toBeTruthy()
      expect(pn.id).toBe(controls)
      expect(pn.getAttribute('aria-labelledby')).toBe(btn.id)
    })
  })

  // JP: イベント
  describe('Events', () => {
    // JP: タブ切替時に onValueChange を発火
    it('emits onValueChange when switching tabs', async () => {
      const { root } = setupTabs({ value: 'tab1' })
      const btn2 = getParts(root, 'tab2').button!
      const p = once<CustomEvent>(root, 'onValueChange')
      btn2.click()
      const ev = await p
      expect(ev.detail.value).toBe('tab2')
    })
  })
})
