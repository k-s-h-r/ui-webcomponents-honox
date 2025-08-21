import { beforeAll, afterEach, beforeEach, vi } from 'vitest'

// Mock implementation for requestAnimationFrame
beforeAll(() => {
  // Mock for both global and globalThis to ensure compatibility
  const mockRAF = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16) // ~60fps
  }
  
  const mockCAF = (id: number) => {
    clearTimeout(id)
  }

  (globalThis as any).global = globalThis;
  (globalThis as any).requestAnimationFrame = mockRAF;
  (globalThis as any).cancelAnimationFrame = mockCAF;
  globalThis.requestAnimationFrame = mockRAF
  globalThis.cancelAnimationFrame = mockCAF
})

// Ensure mocks are available before each test
beforeEach(() => {
  if (!(globalThis as any).requestAnimationFrame) {
    (globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(callback, 16)
    };
    (globalThis as any).cancelAnimationFrame = (id: number) => {
      clearTimeout(id)
    }
  }
})

// Clean up after each test
afterEach(() => {
  // Clear all active timers and animation frames
  vi.clearAllTimers()
  
  // Disconnect any active accordion content components to stop animations
  const accordionContents = Array.from(document.querySelectorAll('ui-accordion-content'));
  for (const content of accordionContents) {
    if (typeof (content as HTMLElement & { disconnectedCallback?: () => void }).disconnectedCallback === 'function') {
      (content as HTMLElement & { disconnectedCallback: () => void }).disconnectedCallback()
    }
  }
  
  // Reset custom elements registry
  // Note: In real browsers, this isn't possible, but for testing we can clean up the DOM
  document.body.innerHTML = ''
  
  // Clear all mocks
  vi.clearAllMocks()
})