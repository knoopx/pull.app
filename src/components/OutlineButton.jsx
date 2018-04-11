import React from 'react'

const OutlineButton = ({ color, className, ...props }) => (
  <button
    className={[
      `text-${color} border border-${color} hover:bg-${color}-light hover:text-white py-2 px-4 rounded flex-auto`,
      className,
    ]}
    {...props}
  />
)

OutlineButton.defaultProps = {
  color: 'indigo',
}

export default OutlineButton
