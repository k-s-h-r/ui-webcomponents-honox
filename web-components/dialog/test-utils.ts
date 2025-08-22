import {
  UiDialog,
  UiDialogTrigger,
  UiDialogContent,
  UiDialogTitle,
  UiDialogDescription,
  UiDialogClose,
  UiDialogOutsideTrigger
} from './index'

type SetupOptions = {
  open?: boolean
  modal?: boolean
  closedby?: 'any' | 'closerequest' | 'none'
  withOutsideTrigger?: boolean
}

export function setupDialog(opts: SetupOptions = {}) {
  const {
    open = false,
    modal = true,
    closedby = 'any',
    withOutsideTrigger = true
  } = opts

  const root = document.createElement('ui-dialog') as UiDialog
  root.id = 'test-dialog'
  if (open) root.setAttribute('open', '')
  if (!modal) root.setAttribute('modal', 'false')
  root.setAttribute('closedby', closedby)

  const trigger = document.createElement('ui-dialog-trigger') as UiDialogTrigger
  const triggerBtn = document.createElement('button')
  triggerBtn.textContent = 'Open'
  trigger.appendChild(triggerBtn)

  const content = document.createElement('ui-dialog-content') as UiDialogContent
  const dialogEl = document.createElement('dialog') as HTMLDialogElement
  // Ensure methods exist in JSDOM
  ;(dialogEl as any).showModal ||= () => {}
  ;(dialogEl as any).show ||= () => {}
  ;(dialogEl as any).close ||= (_?: string) => {}
  const title = document.createElement('ui-dialog-title') as UiDialogTitle
  title.textContent = 'Dialog Title'
  const desc = document.createElement('ui-dialog-description') as UiDialogDescription
  desc.textContent = 'Dialog Description'
  const p = document.createElement('p'); p.textContent = 'Dialog Body'
  const close = document.createElement('ui-dialog-close') as UiDialogClose
  const closeBtn = document.createElement('button')
  closeBtn.textContent = 'Close'
  close.appendChild(closeBtn)

  dialogEl.appendChild(title)
  dialogEl.appendChild(desc)
  dialogEl.appendChild(p)
  dialogEl.appendChild(close)
  content.appendChild(dialogEl)

  root.appendChild(trigger)
  root.appendChild(content)
  document.body.appendChild(root)

  let outside: UiDialogOutsideTrigger | null = null
  if (withOutsideTrigger) {
    outside = document.createElement('ui-dialog-outside-trigger') as UiDialogOutsideTrigger
    outside.setAttribute('data-target', '#test-dialog')
    const outsideBtn = document.createElement('button')
    outsideBtn.textContent = 'External Trigger'
    outside.appendChild(outsideBtn)
    document.body.appendChild(outside)
  }

  // lifecycle hookups
  root.connectedCallback()
  trigger.connectedCallback()
  content.connectedCallback()
  title.connectedCallback()
  desc.connectedCallback()
  close.connectedCallback()
  if (outside) outside.connectedCallback()

  return { root }
}

export function getParts(root: UiDialog) {
  const trigger = root.querySelector('ui-dialog-trigger') as UiDialogTrigger | null
  const triggerBtn = trigger?.querySelector('button') as HTMLButtonElement | null
  const content = root.querySelector('ui-dialog-content') as UiDialogContent | null
  const dialogEl = content?.querySelector('dialog') as HTMLDialogElement | null
  const title = content?.querySelector('ui-dialog-title') as UiDialogTitle | null
  const desc = content?.querySelector('ui-dialog-description') as UiDialogDescription | null
  const closeBtn = content?.querySelector('ui-dialog-close button') as HTMLButtonElement | null
  return { trigger, triggerBtn, content, dialogEl, title, desc, closeBtn }
}

export function once<T extends Event>(el: Element, name: string) {
  return new Promise<T>((resolve) => {
    const handler = (e: Event) => {
      el.removeEventListener(name, handler as EventListener)
      resolve(e as T)
    }
    el.addEventListener(name, handler as EventListener)
  })
}
