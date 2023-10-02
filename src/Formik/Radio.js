import React from 'react'
import { Field, ErrorMessage } from "formik";
import TextError from './TextError';
const Radio = (props) => {
    const { label, name, options , ...rest } = props
    return (
        <>
        {/* <label htmlFor={name}>{label}</label> */}
        <Field id={name} name={name} options {...rest} placeholder={props.placeholder} className="custom-control-input" >
            {
              ({field})=>{
                 return options.map(option=>{
                     return(
                         <>
                           <div className="custom-control custom-radio">
                         <input type='radio'className="custom-control-input" id={option.value} {...field} value={option.value}  checked={field.value===option.value}/>
                     <label className="custom-control-label" htmlFor={option.value}>{option.key}</label>
                     </div>
                         </>
                         
                     )
                 })
              }
            }
        </Field>
        <div>
            <ErrorMessage name={name} component={TextError} />
        </div>
    </>
    )
}

export default Radio
