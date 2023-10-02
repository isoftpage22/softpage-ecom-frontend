import React from 'react'

const InputErrorMessage = (props) => {
  const {errorMessage} = props
  return (
    <p style={{color:'red',fontSize:11}}>{errorMessage}</p>
  )
}

export default InputErrorMessage