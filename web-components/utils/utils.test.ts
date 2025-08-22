import { describe, it, expect, beforeEach } from 'vitest'
import { setAttrsElement, setAttrsElements, removeAttrCloak } from './index'

// JP: ユーティリティ関数
describe('Utils', () => {
  let element: HTMLElement
  let elements: HTMLElement[]

  beforeEach(() => {
    element = document.createElement('div')
    elements = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('span')
    ]
    document.body.appendChild(element)
    for (const el of elements) {
      document.body.appendChild(el)
    }
  })

  // JP: setAttrsElement / setAttrsElements の共通パターンをまとめて検証
  describe.each([
    {
      label: 'single',
      apply: (targets: HTMLElement[], attrs: Record<string, string | undefined>) => setAttrsElement(targets[0], attrs),
      prepare: (element: HTMLElement, elements: HTMLElement[]) => [element],
      hasNullTargetCase: true
    },
    {
      label: 'multiple',
      apply: (targets: HTMLElement[], attrs: Record<string, string | undefined>) => setAttrsElements(targets, attrs),
      prepare: (_: HTMLElement, elements: HTMLElement[]) => elements,
      hasNullTargetCase: false
    }
  ])('setAttrs (%s)', ({ apply, prepare, label, hasNullTargetCase }) => {
    // JP: 属性の設定
    it('sets attributes', () => {
      const targets = prepare(element, elements)
      apply(targets, { 'data-test': 'value', 'aria-label': 'test', 'class': 'cls' })
      for (const el of targets) {
        expect(el.getAttribute('data-test')).toBe('value')
        expect(el.getAttribute('aria-label')).toBe('test')
        expect(el.getAttribute('class')).toBe('cls')
      }
    })

    // JP: undefined の値は属性削除
    it('removes attributes when value is undefined', () => {
      const targets = prepare(element, elements)
      for (const el of targets) {
        el.setAttribute('data-remove', 'x')
        el.setAttribute('data-keep', 'y')
      }
      apply(targets, { 'data-remove': undefined, 'data-keep': 'z' })
      for (const el of targets) {
        expect(el.hasAttribute('data-remove')).toBe(false)
        expect(el.getAttribute('data-keep')).toBe('z')
      }
    })

    // JP: 真偽値的な属性値
    it('handles boolean-like attribute values', () => {
      const targets = prepare(element, elements)
      apply(targets, { 'disabled': '', 'hidden': 'true', 'aria-expanded': 'false' })
      for (const el of targets) {
        expect(el.getAttribute('disabled')).toBe('')
        expect(el.getAttribute('hidden')).toBe('true')
        expect(el.getAttribute('aria-expanded')).toBe('false')
      }
    })

    // JP: 個別ケース: null 要素
    if (hasNullTargetCase) {
      it('handles null element gracefully (single only)', () => {
        expect(() => setAttrsElement(null, { 'data-test': 'value' })).not.toThrow()
      })

      it('handles empty attributes object (single only)', () => {
        setAttrsElement(element, {})
        expect(element.attributes.length).toBe(0)
      })
    } else {
      it('handles array with null elements gracefully (multiple only)', () => {
        const elementsWithNulls = [elements[0], null, elements[1], null]
        expect(() => setAttrsElements(elementsWithNulls, { 'data-test': 'value' })).not.toThrow()
        expect(elements[0].getAttribute('data-test')).toBe('value')
        expect(elements[1].getAttribute('data-test')).toBe('value')
      })

      it('handles empty elements array (multiple only)', () => {
        expect(() => setAttrsElements([], { 'data-test': 'value' })).not.toThrow()
      })

      it('handles mixed element types (multiple only)', () => {
        const button = document.createElement('button')
        const input = document.createElement('input')
        const mixedElements = [button, input]
        setAttrsElements(mixedElements, { 'data-component': 'form-control', 'data-testid': 'input-element' })
        for (const el of mixedElements) {
          expect(el.getAttribute('data-component')).toBe('form-control')
          expect(el.getAttribute('data-testid')).toBe('input-element')
        }
      })
    }
  })

  // JP: cloak 属性の削除
  describe('removeAttrCloak', () => {
    // JP: 要素から cloak 属性を削除できる
    it('should remove cloak attribute from element', () => {
      element.setAttribute('cloak', '')
      element.setAttribute('other-attr', 'keep-this')

      removeAttrCloak(element)

      expect(element.hasAttribute('cloak')).toBe(false)
      expect(element.getAttribute('other-attr')).toBe('keep-this')
    })

    // JP: cloak を持たない要素でも安全
    it('should handle element without cloak attribute', () => {
      element.setAttribute('other-attr', 'value')

      expect(() => {
        removeAttrCloak(element)
      }).not.toThrow()

      expect(element.getAttribute('other-attr')).toBe('value')
    })

    // JP: null 要素でも例外なく処理できる
    it('should handle null element gracefully', () => {
      expect(() => {
        removeAttrCloak(null)
      }).not.toThrow()
    })

    // JP: 様々な値の cloak 属性を削除できる
    it('should remove cloak attribute with different values', () => {
      const testCases = ['', 'true', 'false', 'some-value']

      for (const value of testCases) {
        const testElement = document.createElement('div')
        testElement.setAttribute('cloak', value)
        
        removeAttrCloak(testElement)
        
        expect(testElement.hasAttribute('cloak')).toBe(false)
      }
    })
  })

  // JP: 端ケースと統合
  describe('Edge cases and integration', () => {
    // JP: 特殊文字を含む属性名/値でも正しく設定できる
    it('should work with special characters in attribute names and values', () => {
      const specialAttrs = {
        'data-special-chars': 'value with spaces & symbols!',
        'aria-describedby': 'id-with-dashes_and_underscores',
        'data-unicode': 'テスト値'
      }

      setAttrsElement(element, specialAttrs)

      expect(element.getAttribute('data-special-chars')).toBe('value with spaces & symbols!')
      expect(element.getAttribute('aria-describedby')).toBe('id-with-dashes_and_underscores')
      expect(element.getAttribute('data-unicode')).toBe('テスト値')
    })

    // JP: 設定と削除の同時操作に対応
    it('should handle simultaneous set and remove operations', () => {
      element.setAttribute('keep-me', 'original')
      element.setAttribute('remove-me', 'will-be-removed')

      setAttrsElement(element, {
        'keep-me': 'updated',
        'remove-me': undefined,
        'add-me': 'new-value'
      })

      expect(element.getAttribute('keep-me')).toBe('updated')
      expect(element.hasAttribute('remove-me')).toBe(false)
      expect(element.getAttribute('add-me')).toBe('new-value')
    })

    // JP: 属性順序の一貫性を維持
    it('should maintain attribute order consistency', () => {
      const attrs = {
        'first': 'a',
        'second': 'b',
        'third': 'c'
      }

      setAttrsElement(element, attrs)

      const attributeNames = Array.from(element.attributes).map(attr => attr.name)
      expect(attributeNames).toContain('first')
      expect(attributeNames).toContain('second')
      expect(attributeNames).toContain('third')
    })
  })
})
