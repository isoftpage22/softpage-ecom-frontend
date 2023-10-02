import React from 'react'
import Card from '../../Components/Card/Card'

const AddressCard = (props) => {
  const {children} = props
  return (
    <>
      <Card variant="rounded" justifyContent="space-between" alignItems="flex-start">
         {children}
      </Card>
    </>
  )
}

export default AddressCard