import { beforeAll, afterEach } from 'vitest'

// Mock implementation for requestAnimationFrame
beforeAll(() => {
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16) // ~60fps
  }
  
  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id)
  }
})

// Clean up after each test
afterEach(() => {
  // Reset custom elements registry
  // Note: In real browsers, this isn't possible, but for testing we can clean up the DOM
  document.body.innerHTML = ''
})