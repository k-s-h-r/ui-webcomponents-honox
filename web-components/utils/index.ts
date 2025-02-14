export const setAttrsElements = (
  elements: (HTMLElement | null)[],
  attributes: { [key: string]: string | undefined }
) => {
  for (const element of elements) {
    for (const [key, value] of Object.entries(attributes)) {
      if (value === undefined) {
        element?.removeAttribute(key)
      } else {
        element?.setAttribute(key, value)
      }
    }
  }
}

export const setAttrsElement = (
  element: HTMLElement | null,
  attributes: { [key: string]: string | undefined }
) => {
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined) {
      element?.removeAttribute(key)
    } else {
      element?.setAttribute(key, value)
    }
  }
}
