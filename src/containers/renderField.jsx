import numeral from 'numeral'
import sanitizeHtml from 'sanitize-html'
import React from 'react'

export default function renderField(field, item) {
  const value = item.data[field.name]
  if (value instanceof Error) {
    return (
      <span className="p-1 bg-red-lightest rounded text-xs text-red-light mr-4">
        {value.message}
      </span>
    )
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
