import numeral from 'numeral'
import moment from 'moment'
import sanitizeHtml from 'sanitize-html'
import React from 'react'
import Inspector from 'react-inspector'

export default function renderField(field, item, mode) {
  const value = item.data[field.name]

  if (!value) {
    return
  }

  if (value instanceof Error) {
    return (
      <span className="p-1 bg-red-lightest rounded text-xs text-red-light mr-4">
        {value.message}
      </span>
    )
  }

  // if (mode === 'edit') {
  //   return <Inspector data={value} />
  // }

  switch (field.type) {
    case 'date':
      return moment(value).calendar()
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
