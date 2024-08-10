import React,{useEffect} from 'react'

const OopsComponent = ({setLoader}) => {
    useEffect(() => {
        setLoader(false)
    }, [])
    
  return (
      
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Oops !! Something went wrong</div>
  )
}

export default OopsComponent