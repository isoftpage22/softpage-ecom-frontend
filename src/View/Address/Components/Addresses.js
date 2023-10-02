import React from 'react'
import AddressCard from '../../../Container/AddressCard'
import { Box, Button, Flex, Text, VStack, Grid, GridItem } from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { getAdrresFromLocal } from '../../../utils/CommonFunctions'
import { LOCAL_STORAGE_CUSTOMER_ADDRESS } from '../../../utils/constants'
import {useHistory} from 'react-router'
const Addresses = (props) => {
  const{selected,index,dataKey,setAddresses,selectedAddress}=props
  const history = useHistory()

  const deleteSelectedAddress = ()=>{
    const listOfAddrreses = getAdrresFromLocal()
    let id =  selectedAddress.id
    const filteredAddress = listOfAddrreses.filter((addKey,index)=> addKey.id!== id)
    localStorage.setItem(LOCAL_STORAGE_CUSTOMER_ADDRESS, JSON.stringify(filteredAddress))
    setAddresses(filteredAddress)

  }
  const editSelectedAddress = () =>{
    const listOfAddrreses = getAdrresFromLocal()

  }
  return (
    <>
    {console.log(history,"history")}
          <Grid justifyContent={"center"} templateRows='repeat(3, 1fr)' templateColumns='repeat(3, 1fr)' gap={1} m={2} border={`${selected == index ?'2px solid' :'0.5px solid'} ${ selected == index?'#ffc107' :'#00000040'}`} borderRadius={8}      boxShadow='0.5px 1px #ece6d4'>
            <GridItem p={3} colSpan={2} rowSpan={3} w='100%'  >
            <Flex flexDirection={"column"}>
           <Flex wrap={"wrap"}>
             <Text fontWeight={"extrabold"}>Address Line 1 :</Text>
             <Text fontWeight={"normal"}>{dataKey?.address1}</Text>
           </Flex>
             <Flex wrap={"wrap"}>
             <Text fontWeight={"extrabold"}>Pincode :</Text>
             <Text fontWeight={"normal"}>{dataKey?.pincode}</Text>
             </Flex>
             <Flex wrap={"wrap"}>
             <Text fontWeight={"extrabold"}>Type :</Text>
             <Text fontWeight={"normal"}>{dataKey?.checkbox}</Text>
             </Flex>
           </Flex>            
             </GridItem>
            <GridItem p={3} rowSpan={3} w='100%' h='100%'>
              <Flex justifyContent={"space-around"} alignItems={"flex-end"}>
            <EditIcon color='blue.500' onClick={()=>history.push(`/edit-address/${dataKey.id}`)}/>
              <DeleteIcon onClick={deleteSelectedAddress} color='red.400' />
              </Flex>
            </GridItem>
          </Grid>
    </>
  )
}

export default Addresses