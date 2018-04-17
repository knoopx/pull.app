import { flow, isString, isFunction, isObject, isArray } from 'lodash'

// TODO: https://www.npmjs.com/package/inline-elements
function parseQuery(query) {
  const [selector, rest] = query.split('@', 2)
  const [propName = 'innerText', ...filters] = rest ? rest.split('|') : []
  return {
    selector: selector.trim(),
    propName: propName.trim(),
    filters: filters.map(f => f.trim()),
  }
}

function getProp(propName) {
  return (el) => {
    if (el) {
      if (el[propName]) {
        return el[propName]
      }
      if (el.attributes && el.attributes[propName]) {
        return el.attributes[propName].value
      }
    }

    return null
  }
}

function applyFilters(filters) {
  return value =>
    filters.reduce((result, filter) => {
      if (result) {
        try {
          return eval(`result.${filter}`)
        } catch (e) {
          throw new Error(`Filter error: ${filter}: ${e}`)
        }
      }
      return null
    }, value && value.trim())
}

// {
//   value: 'a@href',
//   array: ['a@href'],
//   transform: x('a@href', (href) => href.reverse() ),
//   fn: (el) => el.querySelector('[title]'),
// }
function shape(schema) {
  return el =>
    Object.keys(schema).reduce((result, propName) => {
      const value = schema[propName]
      if (isFunction(value)) {
        result[propName] = value(el)
      } else {
        result[propName] = select(value)(el)
      }
      return result
    }, {})
}

// x(['a'], (val) => val)
// x(['.thumb-container'], {
//   key: 'a@href',
//   title: '.title@textContent',
//   thumbs: ['img@src | replace("-small", "")'],
// })
//
function queryAll(query, schema) {
  return (doc) => {
    const { selector, propName, filters } = parseQuery(query)
    const results = Array.from(doc.querySelectorAll(selector))
    if (isFunction(schema)) {
      if (query.includes('@')) {
        return results.map(flow(getProp(propName), applyFilters(filters), schema))
      }
      return results.map(schema)
    }
    if (isObject(schema)) {
      return results.map(shape(schema))
    }

    return results.map(flow(getProp(propName), applyFilters(filters)))
  }
}

// x('@href')
// x('a@href')
// x('a@href', (href) => href)
function queryOne(query, fn = val => val) {
  return (doc) => {
    if (isString(query)) {
      const { selector, propName, filters } = parseQuery(query)
      if (selector && selector.length) {
        try {
          const value = doc.querySelector(selector)
          return flow(getProp(propName), applyFilters(filters), fn)(value)
        } catch (err) {
          return err
        }
      }
      return flow(getProp(propName), applyFilters(filters), fn)(doc)
    } else if (isObject(query)) {
      // x({ href : "a@href" })
      // x({ href : "a@href" }, (res) => res.href )
      return flow(shape(query), fn)(doc)
    }
    throw new Error(`Invalid query: ${JSON.stringify(query)}`)
  }
}

export default function select(query, ...opts) {
  // x(["query"], ...)
  if (isArray(query)) {
    if (query.length === 1) {
      return queryAll(...[...query, ...opts])
    }
    throw new Error(`Invalid query: ${JSON.stringify(query)}`)
  }
  // x("div@attr", ...)
  // x("@attr", ...)
  // x({key: "value"}, ...)
  if (isString(query) || isObject(query)) {
    return queryOne(query, ...opts)
  }

  throw new Error(`Invalid query: ${JSON.stringify(query)}`)
}
