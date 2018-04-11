import { types as t } from 'mobx-state-tree'

const Base = t
  .model({
    name: t.string,
    selector: t.string,
    type: t.enumeration(['text', 'number', 'image', 'html']),
  })
  .actions(self => ({
    update(props) {
      Object.assign(self, props)
    },
  }))

const NumberField = t.compose(
  'NumberField',
  Base,
  t.model({
    format: t.optional(t.string, '0[.]00'),
  }),
)

const TextField = t.compose('TextField', Base)
const HTMLField = t.compose(
  'HTMLField',
  Base,
  t.model({
    allowedTags: t.optional(t.array(t.string), []),
  }),
)
const ImageField = t.compose(
  'ImageField',
  Base,
  t.model({
    width: t.optional(t.string, ''),
    height: t.optional(t.string, ''),
  }),
)

const TYPES = {
  number: NumberField,
  text: TextField,
  image: ImageField,
  html: HTMLField,
}

export default t.union(
  ({ type }) => TYPES[type],
  TextField,
  NumberField,
  ImageField,
  HTMLField,
)
