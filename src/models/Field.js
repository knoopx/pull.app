import { types as t } from 'mobx-state-tree'

export default t
  .model({
    name: t.string,
    selector: t.string,
    allowedTags: t.optional(t.array(t.string), []),
    format: t.optional(t.string, '0[.]00'),
    width: t.optional(t.string, ''),
    height: t.optional(t.string, ''),
    type: t.enumeration(['text', 'number', 'image', 'html']),
  })
  .actions(self => ({
    update(props) {
      Object.assign(self, props)
    },
  }))
