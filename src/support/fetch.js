import urlJoin from 'url-join'

export function absolutize(url, baseUrl) {
  if (
    !url ||
    /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url)
  ) {
    return url
  }

  if (url.match(/^\/\//)) {
    return `http:${url}`
  }

  return urlJoin(baseUrl, url)
}

function _rewrite(baseUrl, attrName) {
  return (el) => {
    if (el.attributes[attrName]) {
      el.attributes[attrName].value = absolutize(
        el.attributes[attrName].value,
        baseUrl,
      )
    }
  }
}

export function rewrite(doc, baseUrl) {
  Array.from(doc.querySelectorAll('img, script,iframe')).forEach(_rewrite(baseUrl, 'src'))
  Array.from(doc.querySelectorAll('a, link')).forEach(_rewrite(baseUrl, 'href'))
  return doc
}

export default async function (_url, format, params = {}, opts = {}) {
  const url = new URL(_url)
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  const res = await fetch(url, { ...opts })
  const body = await res.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(body, format)
  rewrite(doc, url.origin)
  return doc
}
