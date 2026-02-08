export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  const tempDiv = typeof window !== 'undefined' ? document.createElement('div') : null
  if (!tempDiv) return html
  
  tempDiv.innerHTML = html
  
  const ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'
  ])
  
  const ALLOWED_ATTRS = new Map([
    ['a', ['href', 'title', 'target']],
    ['img', ['src', 'alt', 'width', 'height', 'class']],
    ['*', ['class']]
  ])
  
  function sanitizeNode(node: Node): void {
    if (node.nodeType === 3) return
    
    if (node.nodeType === 1) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()
      
      if (!ALLOWED_TAGS.has(tagName)) {
        if (node.parentNode) {
          node.parentNode.replaceChild(document.createTextNode(element.textContent || ''), node)
        }
        return
      }
      
      Array.from(element.attributes).forEach(attr => {
        const allowedForTag = ALLOWED_ATTRS.get(tagName) || []
        const allowedForAll = ALLOWED_ATTRS.get('*') || []
        const isAllowed = allowedForTag.includes(attr.name) || allowedForAll.includes(attr.name)
        
        if (!isAllowed || attr.name.startsWith('on')) {
          element.removeAttribute(attr.name)
        } else if (attr.name === 'href') {
          try {
            const url = new URL(attr.value, 'http://base')
            if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
              element.removeAttribute(attr.name)
            }
          } catch {
            element.removeAttribute(attr.name)
          }
        }
      })
      
      Array.from(node.childNodes).forEach(sanitizeNode)
    }
  }
  
  Array.from(tempDiv.childNodes).forEach(sanitizeNode)
  
  return tempDiv.innerHTML
}
