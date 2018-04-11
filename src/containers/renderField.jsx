import numeral from 'numeral'
import sanitizeHtml from 'sanitize-html'
import React from 'react'

export default function renderField(field, item) {
  if (item.data[field.name] instanceof Error) {
    return (
      <span className="p-1 bg-red-lightest rounded text-xs text-red-light mr-4">
        {item.data[field.name].message}
      </span>
    )
  }

  switch (field.type) {
    case 'number':
      return numeral(item.data[field.name]).format(field.format)
    case 'image':
      return (
        <img
          src={item.data[field.name]}
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
            __html: sanitizeHtml(item.data[field.name], {
              allowedTags: field.allowedTags && field.allowedTags,
            }),
          }}
        />
      )
    default:
      return String(item.data[field.name])
  }
}
