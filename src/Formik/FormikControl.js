import React from 'react'
import Input from './Input'
import Select from './Select'
import Radio from './Radio'
import TextArea from './TextArea'
import Phone from './PhoneInputField'



function FormikControl(props) {
  const { control, ...rest } = props
 
  switch (control) {
    case 'input':
      return <Input {...rest} />
    case 'textarea':
      return <TextArea {...rest} />
    case 'select':
      return <Select {...rest} />
    case 'radio':
      return <Radio {...rest} />
    case 'phone':
      return <Phone {...rest} />
    case 'checkbox':
    case 'date':
    default: return null
  }

}

export default FormikControl
