import React from 'react'
import { Field, ErrorMessage } from "formik";
import TextError from './TextError';

const TextArea = (props) => {
    const { label, name, options,error , ...rest } = props
    return (
        <>
        <Field as="textarea"  
        className={error?'form-contact-textarea-error':props.className}
        id={name}
        name={name}
        style={{width:'100%'}}
        {...rest}
         placeholder={props.placeholder}
        
           />
        <div>
            <ErrorMessage name={name} component={TextError} />
        </div>
        </>
    )
}

export default TextArea
