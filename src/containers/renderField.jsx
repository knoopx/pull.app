import numeral from 'numeral'
import sanitizeHtml from 'sanitize-html'
import React from 'react'
import Inspector from 'react-inspector'

function nodeToValue(node) {
  if (Array.isArray(node)) {
    return node.map(nodeToValue)
  }

  if (node instanceof Element) {
    return node.outerHTML
  }

  if (node instanceof Text) {
    return node.nodeValue
  }

  return node
}

export default function renderField(field, item, mode) {
  const value = nodeToValue(item.data[field.name])

  if (value instanceof Error) {
    return (
      <span className="p-1 bg-red-lightest rounded text-xs text-red-light mr-4">
        {value.message}
      </span>
    )
  }

  if (mode === 'edit') {
    return <Inspector data={item.data[field.name]} />
  }

  switch (field.type) {
    case 'number':
      return numeral(value).format(field.format)
    case 'image':
      return (
        <img
          src={value}
          className=""
          style={{
            width: field.width,
            height: field.height,
          }}
        />
      )
    case 'html':
      return (
        <div
          className="embed"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(value, {
              allowedTags: field.allowedTags && field.allowedTags,
            }),
          }}
        />
      )
    default:
      return String(value)
  }
}
