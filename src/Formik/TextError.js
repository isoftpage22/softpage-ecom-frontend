import React from 'react'

function TextError(props) {
    return (
        <div className='error' style={{color:'#dc3545'}} >
            {props.children}
        </div>
    )
}

export default TextError
