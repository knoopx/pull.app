import React from 'react'

const Input = ({ className, ...props }) => (
  <input
    className={[
      'appearance-none border rounded w-full py-2 px-3 text-grey-darker mb-1',
      className,
    ]}
    {...props}
  />
)

export default Input
