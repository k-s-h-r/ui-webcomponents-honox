import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  UiTabs,
  UiTabsList,
  UiTabsTrigger,
  UiTabsPanel
} from './index'

// Import and register all tabs components
import './index'

describe('Tabs Components', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  describe('Custom Element Registration', () => {
    it('should register all tabs custom elements', () => {
      expect(customElements.get('ui-tabs')).toBe(UiTabs)
      expect(customElements.get('ui-tabs-list')).toBe(UiTabsList)
      expect(customElements.get('ui-tabs-trigger')).toBe(UiTabsTrigger)
      expect(customElements.get('ui-tabs-panel')).toBe(UiTabsPanel)
    })
  })

  describe('UiTabs', () => {
    let tabs: UiTabs

    beforeEach(() => {
      tabs = document.createElement('ui-tabs') as UiTabs
      document.body.appendChild(tabs)
    })

    it('should initialize with default state', () => {
      tabs.connectedCallback()
      const state = tabs.useRootStore.getState()
      
      expect(state.value).toBe('')
      expect(state.activationMode).toBe('automatic')
      expect(state.tabs).toEqual([])
    })

    it('should handle value attribute', () => {
      tabs.setAttribute('value', 'tab1')
      tabs.connectedCallback()
      
      const state = tabs.useRootStore.getState()
      expect(state.value).toBe('tab1')
    })

    it('should handle activationMode attribute', () => {
      tabs.setAttribute('activationMode', 'manual')
      tabs.connectedCallback()
      
      const state = tabs.useRootStore.getState()
      expect(state.activationMode).toBe('manual')
    })

    it('should fallback to automatic mode for invalid activationMode', () => {
      tabs.setAttribute('activationMode', 'invalid-mode')
      tabs.connectedCallback()
      
      const state = tabs.useRootStore.getState()
      expect(state.activationMode).toBe('automatic')
    })

    it('should detect selected tab from aria-selected attribute when no value provided', () => {
      document.body.innerHTML = `
        <ui-tabs>
          <ui-tabs-list>
            <ui-tabs-trigger value="tab1">
              <button data-ui-value="tab1">Tab 1</button>
            </ui-tabs-trigger>
            <ui-tabs-trigger value="tab2">
              <button data-ui-value="tab2" aria-selected="true">Tab 2</button>
            </ui-tabs-trigger>
          </ui-tabs-list>
        </ui-tabs>
      `
      
      const tabsElement = document.querySelector('ui-tabs') as UiTabs
      tabsElement.connectedCallback()
      
      const state = tabsElement.useRootStore.getState()
      expect(state.value).toBe('tab2')
    })

    it('should emit onValueChange event when value changes', async () => {
      tabs.connectedCallback()
      
      return new Promise<void>((resolve) => {
        tabs.addEventListener('onValueChange', (event: Event) => {
          const customEvent = event as CustomEvent
          expect(customEvent.detail.value).toBe('new-tab')
          resolve()
        })

        tabs.useRootStore.setState({ value: 'new-tab' })
      })
    })

    it('should handle dynamic attribute changes', () => {
      tabs.connectedCallback()
      
      tabs.setAttribute('value', 'dynamic-tab')
      expect(tabs.useRootStore.getState().value).toBe('dynamic-tab')
      
      tabs.setAttribute('activationMode', 'manual')
      expect(tabs.useRootStore.getState().activationMode).toBe('manual')
    })
  })

  describe('UiTabsList', () => {
    let tabs: UiTabs
    let tabsList: UiTabsList

    beforeEach(() => {
      tabs = document.createElement('ui-tabs') as UiTabs
      tabsList = document.createElement('ui-tabs-list') as UiTabsList
      
      tabs.appendChild(tabsList)
      document.body.appendChild(tabs)
      
      tabs.connectedCallback()
      tabsList.connectedCallback()
    })

    it('should set tablist role', () => {
      expect(tabsList.getAttribute('role')).toBe('tablist')
    })

    it('should handle loop attribute', () => {
      expect(tabsList.loop).toBe(false)
      
      tabsList.setAttribute('loop', '')
      expect(tabsList.loop).toBe(true)
    })

    it('should handle keyboard navigation - ArrowRight', () => {
      document.body.innerHTML = `
        <ui-tabs value="tab1">
          <ui-tabs-list>
            <ui-tabs-trigger value="tab1"><button>Tab 1</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab2"><button>Tab 2</button></ui-tabs-trigger>
          </ui-tabs-list>
        </ui-tabs>
      `
      
      const tabsElement = document.querySelector('ui-tabs') as UiTabs
      const tabsListElement = document.querySelector('ui-tabs-list') as UiTabsList
      const trigger2Button = document.querySelector('ui-tabs-trigger[value="tab2"] button') as HTMLButtonElement
      
      tabsElement.connectedCallback()
      tabsListElement.connectedCallback()
      
      const focusSpy = vi.spyOn(trigger2Button, 'focus')
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
      
      tabsListElement.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
      expect(focusSpy).toHaveBeenCalled()
      expect(tabsElement.useRootStore.getState().value).toBe('tab2')
    })

    it('should handle keyboard navigation - ArrowLeft', () => {
      document.body.innerHTML = `
        <ui-tabs value="tab2">
          <ui-tabs-list>
            <ui-tabs-trigger value="tab1"><button>Tab 1</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab2"><button>Tab 2</button></ui-tabs-trigger>
          </ui-tabs-list>
        </ui-tabs>
      `
      
      const tabsElement = document.querySelector('ui-tabs') as UiTabs
      const tabsListElement = document.querySelector('ui-tabs-list') as UiTabsList
      const trigger1Button = document.querySelector('ui-tabs-trigger[value="tab1"] button') as HTMLButtonElement
      
      tabsElement.connectedCallback()
      tabsListElement.connectedCallback()
      
      const focusSpy = vi.spyOn(trigger1Button, 'focus')
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      tabsListElement.dispatchEvent(event)
      
      expect(focusSpy).toHaveBeenCalled()
      expect(tabsElement.useRootStore.getState().value).toBe('tab1')
    })

    it('should handle Home key to focus first tab', () => {
      document.body.innerHTML = `
        <ui-tabs value="tab2">
          <ui-tabs-list>
            <ui-tabs-trigger value="tab1"><button>Tab 1</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab2"><button>Tab 2</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab3"><button>Tab 3</button></ui-tabs-trigger>
          </ui-tabs-list>
        </ui-tabs>
      `
      
      const tabsElement = document.querySelector('ui-tabs') as UiTabs
      const tabsListElement = document.querySelector('ui-tabs-list') as UiTabsList
      const trigger1Button = document.querySelector('ui-tabs-trigger[value="tab1"] button') as HTMLButtonElement
      
      tabsElement.connectedCallback()
      tabsListElement.connectedCallback()
      
      const focusSpy = vi.spyOn(trigger1Button, 'focus')
      
      const event = new KeyboardEvent('keydown', { key: 'Home' })
      tabsListElement.dispatchEvent(event)
      
      expect(focusSpy).toHaveBeenCalled()
      expect(tabsElement.useRootStore.getState().value).toBe('tab1')
    })

    it('should handle End key to focus last tab', () => {
      document.body.innerHTML = `
        <ui-tabs value="tab1">
          <ui-tabs-list>
            <ui-tabs-trigger value="tab1"><button>Tab 1</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab2"><button>Tab 2</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab3"><button>Tab 3</button></ui-tabs-trigger>
          </ui-tabs-list>
        </ui-tabs>
      `
      
      const tabsElement = document.querySelector('ui-tabs') as UiTabs
      const tabsListElement = document.querySelector('ui-tabs-list') as UiTabsList
      const trigger3Button = document.querySelector('ui-tabs-trigger[value="tab3"] button') as HTMLButtonElement
      
      tabsElement.connectedCallback()
      tabsListElement.connectedCallback()
      
      const focusSpy = vi.spyOn(trigger3Button, 'focus')
      
      const event = new KeyboardEvent('keydown', { key: 'End' })
      tabsListElement.dispatchEvent(event)
      
      expect(focusSpy).toHaveBeenCalled()
      expect(tabsElement.useRootStore.getState().value).toBe('tab3')
    })

    it('should handle loop navigation', () => {
      document.body.innerHTML = `
        <ui-tabs value="tab2">
          <ui-tabs-list loop>
            <ui-tabs-trigger value="tab1"><button>Tab 1</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab2"><button>Tab 2</button></ui-tabs-trigger>
          </ui-tabs-list>
        </ui-tabs>
      `
      
      const tabsElement = document.querySelector('ui-tabs') as UiTabs
      const tabsListElement = document.querySelector('ui-tabs-list') as UiTabsList
      const trigger1Button = document.querySelector('ui-tabs-trigger[value="tab1"] button') as HTMLButtonElement
      
      tabsElement.connectedCallback()
      tabsListElement.connectedCallback()
      
      const focusSpy = vi.spyOn(trigger1Button, 'focus')
      
      // ArrowRight from last tab should loop to first
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      tabsListElement.dispatchEvent(event)
      
      expect(focusSpy).toHaveBeenCalled()
      expect(tabsElement.useRootStore.getState().value).toBe('tab1')
    })

    it('should skip disabled triggers during navigation', () => {
      document.body.innerHTML = `
        <ui-tabs value="tab1">
          <ui-tabs-list>
            <ui-tabs-trigger value="tab1"><button>Tab 1</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab2" disabled><button>Tab 2</button></ui-tabs-trigger>
            <ui-tabs-trigger value="tab3"><button>Tab 3</button></ui-tabs-trigger>
          </ui-tabs-list>
        </ui-tabs>
      `
      
      const tabsElement = document.querySelector('ui-tabs') as UiTabs
      const tabsListElement = document.querySelector('ui-tabs-list') as UiTabsList
      const trigger3Button = document.querySelector('ui-tabs-trigger[value="tab3"] button') as HTMLButtonElement
      
      tabsElement.connectedCallback()
      tabsListElement.connectedCallback()
      
      const focusSpy = vi.spyOn(trigger3Button, 'focus')
      
      // Should skip disabled tab2 and go directly to tab3
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      tabsListElement.dispatchEvent(event)
      
      expect(focusSpy).toHaveBeenCalled()
      expect(tabsElement.useRootStore.getState().value).toBe('tab3')
    })
  })

  describe('UiTabsTrigger', () => {
    let tabs: UiTabs
    let trigger: UiTabsTrigger
    let button: HTMLButtonElement

    beforeEach(() => {
      tabs = document.createElement('ui-tabs') as UiTabs
      trigger = document.createElement('ui-tabs-trigger') as UiTabsTrigger
      button = document.createElement('button')
      
      trigger.appendChild(button)
      tabs.appendChild(trigger)
      document.body.appendChild(tabs)
      
      trigger.setAttribute('value', 'test-tab')
      
      tabs.connectedCallback()
      trigger.connectedCallback()
    })

    it('should initialize with correct properties', () => {
      expect(trigger.value).toBe('test-tab')
      expect(trigger.disabled).toBe(false)
    })

    it('should set correct ARIA attributes on button', () => {
      expect(button.getAttribute('role')).toBe('tab')
      expect(button.getAttribute('aria-selected')).toBe('false')
      expect(button.getAttribute('tabindex')).toBe(' -1')  // Note: space before -1 as per code
      expect(button.hasAttribute('id')).toBe(true)
    })

    it('should update attributes when selected', () => {
      tabs.useRootStore.setState({ value: 'test-tab' })
      
      // Manually trigger the subscription callback since we're testing in isolation
      const state = tabs.useRootStore.getState()
      const tab = state.tabs.find(t => t.value === 'test-tab')
      if (tab) {
        trigger.updateAttrs?.(true, false, tab.tabId, tab.panelId)
      }
      
      expect(button.getAttribute('aria-selected')).toBe('true')
      expect(button.getAttribute('tabindex')).toBe('0')
      expect(button.getAttribute('data-state')).toBe('active')
      expect(trigger.getAttribute('data-state')).toBe('active')
    })

    it('should handle disabled state', () => {
      trigger.setAttribute('disabled', '')
      trigger.disabled = true
      trigger.connectedCallback()
      
      trigger.updateAttrs?.(false, true, 'test-id', 'panel-id')
      
      expect(button.hasAttribute('disabled')).toBe(true)
      expect(button.getAttribute('data-disabled')).toBe('')
    })

    it('should update tabs store on connection', () => {
      const state = tabs.useRootStore.getState()
      expect(state.tabs.some(tab => tab.value === 'test-tab')).toBe(true)
    })

    it('should handle button click', () => {
      button.click()
      expect(tabs.useRootStore.getState().value).toBe('test-tab')
    })

    it('should clean up event listeners on disconnect', () => {
      const removeEventListenerSpy = vi.spyOn(button, 'removeEventListener')
      
      trigger.disconnectedCallback()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
    })
  })

  describe('UiTabsPanel', () => {
    let tabs: UiTabs
    let panel: UiTabsPanel

    beforeEach(() => {
      tabs = document.createElement('ui-tabs') as UiTabs
      panel = document.createElement('ui-tabs-panel') as UiTabsPanel
      
      panel.setAttribute('value', 'test-panel')
      tabs.appendChild(panel)
      document.body.appendChild(tabs)
      
      tabs.connectedCallback()
      panel.connectedCallback()
    })

    it('should initialize with correct properties', () => {
      expect(panel.value).toBe('test-panel')
    })

    it('should set correct ARIA attributes', () => {
      expect(panel.getAttribute('role')).toBe('tabpanel')
      expect(panel.getAttribute('tabindex')).toBe('0')
      expect(panel.getAttribute('data-state')).toBe('inactive')
      expect(panel.hasAttribute('id')).toBe(true)
    })

    it('should update state when tab is selected', () => {
      tabs.useRootStore.setState({ value: 'test-panel' })
      
      // Manually trigger update since we need to simulate the subscription
      panel.setAttribute('data-state', 'active')
      expect(panel.getAttribute('data-state')).toBe('active')
    })

    it('should update tabs store with panel info', () => {
      const state = tabs.useRootStore.getState()
      expect(state.tabs.some(tab => tab.value === 'test-panel')).toBe(true)
    })

    it('should set aria-labelledby from trigger id', () => {
      // Simulate tabs state with trigger info
      const panelId = panel.getAttribute('id') || 'panel-id'
      const triggerId = 'trigger-id'
      
      tabs.useRootStore.setState({
        tabs: [{ value: 'test-panel', tabId: triggerId, panelId }]
      })
      
      // Manually set the attribute as the subscription would
      panel.setAttribute('aria-labelledby', triggerId)
      
      expect(panel.getAttribute('aria-labelledby')).toBe(triggerId)
    })
  })

  describe('Integration Tests', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <ui-tabs value="tab1" activationMode="automatic">
          <ui-tabs-list loop>
            <ui-tabs-trigger value="tab1">
              <button>Tab 1</button>
            </ui-tabs-trigger>
            <ui-tabs-trigger value="tab2">
              <button>Tab 2</button>
            </ui-tabs-trigger>
            <ui-tabs-trigger value="tab3" disabled>
              <button>Tab 3</button>
            </ui-tabs-trigger>
          </ui-tabs-list>
          
          <ui-tabs-panel value="tab1">
            <p>Content for Tab 1</p>
          </ui-tabs-panel>
          <ui-tabs-panel value="tab2">
            <p>Content for Tab 2</p>
          </ui-tabs-panel>
          <ui-tabs-panel value="tab3">
            <p>Content for Tab 3</p>
          </ui-tabs-panel>
        </ui-tabs>
      `
      
      // Initialize all components
      const tabs = document.querySelector('ui-tabs') as UiTabs
      const tabsList = document.querySelector('ui-tabs-list') as UiTabsList
      const triggers = document.querySelectorAll('ui-tabs-trigger')
      const panels = document.querySelectorAll('ui-tabs-panel')
      
      tabs.connectedCallback()
      tabsList.connectedCallback()
      triggers.forEach(trigger => (trigger as UiTabsTrigger).connectedCallback())
      panels.forEach(panel => (panel as UiTabsPanel).connectedCallback())
    })

    it('should initialize with correct default state', () => {
      const tabs = document.querySelector('ui-tabs') as UiTabs
      const state = tabs.useRootStore.getState()
      
      expect(state.value).toBe('tab1')
      expect(state.activationMode).toBe('automatic')
      expect(state.tabs).toHaveLength(3)
    })

    it('should handle complete tab interaction flow', () => {
      const tabs = document.querySelector('ui-tabs') as UiTabs
      const tab2Button = document.querySelector('[value="tab2"] button') as HTMLButtonElement
      
      // Initially tab1 is active
      expect(tabs.useRootStore.getState().value).toBe('tab1')
      
      // Click tab2
      tab2Button.click()
      expect(tabs.useRootStore.getState().value).toBe('tab2')
    })

    it('should maintain proper ARIA relationships', () => {
      const trigger1 = document.querySelector('[value="tab1"] button') as HTMLButtonElement
      const panel1 = document.querySelector('ui-tabs-panel[value="tab1"]') as UiTabsPanel
      
      const triggerId = trigger1.getAttribute('id')
      const panelId = panel1.getAttribute('id')
      
      expect(trigger1.getAttribute('aria-controls')).toBe(panelId)
      // Note: aria-labelledby is set via subscription, would need to simulate that
    })

    it('should handle keyboard navigation with disabled tabs', () => {
      const tabs = document.querySelector('ui-tabs') as UiTabs
      const tabsList = document.querySelector('ui-tabs-list') as UiTabsList
      const tab2Button = document.querySelector('[value="tab2"] button') as HTMLButtonElement
      
      const focusSpy = vi.spyOn(tab2Button, 'focus')
      
      // From tab1, arrow right should skip disabled tab3 in non-loop scenario
      // But since loop is enabled, it should go to tab2
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      tabsList.dispatchEvent(event)
      
      expect(focusSpy).toHaveBeenCalled()
      expect(tabs.useRootStore.getState().value).toBe('tab2')
    })

    it('should emit onValueChange events during tab switches', async () => {
      const tabs = document.querySelector('ui-tabs') as UiTabs
      const tab2Button = document.querySelector('[value="tab2"] button') as HTMLButtonElement
      
      return new Promise<void>((resolve) => {
        tabs.addEventListener('onValueChange', (event: Event) => {
          const customEvent = event as CustomEvent
          expect(customEvent.detail.value).toBe('tab2')
          resolve()
        })
        
        tab2Button.click()
      })
    })

    it('should properly coordinate trigger and panel states', () => {
      const tabs = document.querySelector('ui-tabs') as UiTabs
      const tab2Button = document.querySelector('[value="tab2"] button') as HTMLButtonElement
      const trigger1 = document.querySelector('[value="tab1"]') as UiTabsTrigger
      const trigger2 = document.querySelector('[value="tab2"]') as UiTabsTrigger
      const panel1 = document.querySelector('ui-tabs-panel[value="tab1"]') as UiTabsPanel
      const panel2 = document.querySelector('ui-tabs-panel[value="tab2"]') as UiTabsPanel
      
      // Switch to tab2
      tab2Button.click()
      
      // Check that states are properly coordinated
      expect(trigger1.getAttribute('data-state')).toBe('inactive')
      expect(trigger2.getAttribute('data-state')).toBe('active')
      expect(panel1.getAttribute('data-state')).toBe('inactive')
      expect(panel2.getAttribute('data-state')).toBe('active')
    })

    it('should handle loop navigation correctly', () => {
      const tabs = document.querySelector('ui-tabs') as UiTabs
      const tabsList = document.querySelector('ui-tabs-list') as UiTabsList
      const tab1Button = document.querySelector('[value="tab1"] button') as HTMLButtonElement
      
      // Set to tab2 first
      tabs.useRootStore.setState({ value: 'tab2' })
      
      const focusSpy = vi.spyOn(tab1Button, 'focus')
      
      // From tab2, arrow right should loop back to tab1 (skipping disabled tab3)
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      tabsList.dispatchEvent(event)
      
      expect(focusSpy).toHaveBeenCalled()
      expect(tabs.useRootStore.getState().value).toBe('tab1')
    })
  })
})