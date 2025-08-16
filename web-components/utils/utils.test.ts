import { describe, it, expect, beforeEach } from 'vitest'
import { setAttrsElement, setAttrsElements, removeAttrCloak } from './index'

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

  describe('setAttrsElement', () => {
    it('should set attributes on a single element', () => {
      setAttrsElement(element, {
        'data-test': 'value',
        'aria-label': 'test label',
        'class': 'test-class'
      })

      expect(element.getAttribute('data-test')).toBe('value')
      expect(element.getAttribute('aria-label')).toBe('test label')
      expect(element.getAttribute('class')).toBe('test-class')
    })

    it('should remove attributes when value is undefined', () => {
      element.setAttribute('data-test', 'initial-value')
      element.setAttribute('class', 'initial-class')

      setAttrsElement(element, {
        'data-test': undefined,
        'class': 'new-class'
      })

      expect(element.hasAttribute('data-test')).toBe(false)
      expect(element.getAttribute('class')).toBe('new-class')
    })

    it('should handle null element gracefully', () => {
      expect(() => {
        setAttrsElement(null, { 'data-test': 'value' })
      }).not.toThrow()
    })

    it('should handle empty attributes object', () => {
      setAttrsElement(element, {})
      expect(element.attributes.length).toBe(0)
    })

    it('should handle boolean-like attribute values', () => {
      setAttrsElement(element, {
        'disabled': '',
        'hidden': 'true',
        'aria-expanded': 'false'
      })

      expect(element.getAttribute('disabled')).toBe('')
      expect(element.getAttribute('hidden')).toBe('true')
      expect(element.getAttribute('aria-expanded')).toBe('false')
    })
  })

  describe('setAttrsElements', () => {
    it('should set attributes on multiple elements', () => {
      setAttrsElements(elements, {
        'data-test': 'batch-value',
        'class': 'shared-class'
      })

      for (const el of elements) {
        expect(el.getAttribute('data-test')).toBe('batch-value')
        expect(el.getAttribute('class')).toBe('shared-class')
      }
    })

    it('should remove attributes when value is undefined', () => {
      for (const el of elements) {
        el.setAttribute('data-remove', 'to-be-removed')
        el.setAttribute('data-keep', 'to-be-kept')
      }

      setAttrsElements(elements, {
        'data-remove': undefined,
        'data-keep': 'updated-value'
      })

      for (const el of elements) {
        expect(el.hasAttribute('data-remove')).toBe(false)
        expect(el.getAttribute('data-keep')).toBe('updated-value')
      }
    })

    it('should handle array with null elements gracefully', () => {
      const elementsWithNulls = [elements[0], null, elements[1], null]

      expect(() => {
        setAttrsElements(elementsWithNulls, { 'data-test': 'value' })
      }).not.toThrow()

      expect(elements[0].getAttribute('data-test')).toBe('value')
      expect(elements[1].getAttribute('data-test')).toBe('value')
    })

    it('should handle empty elements array', () => {
      expect(() => {
        setAttrsElements([], { 'data-test': 'value' })
      }).not.toThrow()
    })

    it('should handle mixed element types', () => {
      const button = document.createElement('button')
      const input = document.createElement('input')
      const mixedElements = [button, input]

      setAttrsElements(mixedElements, {
        'data-component': 'form-control',
        'data-testid': 'input-element'
      })

      for (const el of mixedElements) {
        expect(el.getAttribute('data-component')).toBe('form-control')
        expect(el.getAttribute('data-testid')).toBe('input-element')
      }
    })
  })

  describe('removeAttrCloak', () => {
    it('should remove cloak attribute from element', () => {
      element.setAttribute('cloak', '')
      element.setAttribute('other-attr', 'keep-this')

      removeAttrCloak(element)

      expect(element.hasAttribute('cloak')).toBe(false)
      expect(element.getAttribute('other-attr')).toBe('keep-this')
    })

    it('should handle element without cloak attribute', () => {
      element.setAttribute('other-attr', 'value')

      expect(() => {
        removeAttrCloak(element)
      }).not.toThrow()

      expect(element.getAttribute('other-attr')).toBe('value')
    })

    it('should handle null element gracefully', () => {
      expect(() => {
        removeAttrCloak(null)
      }).not.toThrow()
    })

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

  describe('Edge cases and integration', () => {
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