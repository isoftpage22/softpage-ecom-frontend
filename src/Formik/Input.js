import React from 'react'
import { Field, ErrorMessage } from "formik";
import TextError from './TextError';
import {

    Input as FormikInput, InputGroup, InputLeftElement,

} from "@chakra-ui/react"
import { PhoneIcon, AddIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons'

function Input(props) {
    const { label, name, border, error, disabled, ...rest } = props
    return (
        <>
           
           <InputGroup>
                <InputLeftElement pointerEvents='none'>
                  <PhoneIcon color='gray.300' />
                </InputLeftElement>
                <FormikInput placeholder='Customer Name' />
               
              </InputGroup>
                


        </>
    )
}

export default Input
