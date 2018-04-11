import React from 'react'

export default ({ className, ...props }) => (
  <a
    className={['cursor-pointer inline-flex items-center', className]}
    {...props}
  />
)
