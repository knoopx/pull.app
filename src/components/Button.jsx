import React from 'react'

const Button = ({ color, className, ...props }) => (
  <button
    className={[
      `bg-${color} hover:bg-${color}-dark text-white font-bold py-2 px-4 rounded flex-auto`,
      className,
    ]}
    {...props}
  />
)

Button.defaultProps = {
  color: 'indigo',
}

export default Button
