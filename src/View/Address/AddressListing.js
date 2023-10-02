import React,{Fragment,useState} from 'react'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import { Box,Button,Flex,Text,VStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom';
import AddressCard from '../../Container/AddressCard';
import CreateButton from './Components/CreateButton';
import Addresses from './Components/Addresses';
import  './AddressListing.css'
import ContinueButton from './Components/ContinueButton';
import { getAdrresFromLocal, getCurrentAddres } from '../../utils/CommonFunctions';
import {saveUsersAddress } from '../../Store/action/addresses';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
const AddressListing = (props) => {
  const {saveUsersAddress,history} =props
  const [selected, setSelected] = useState(0)
  const [addresses, setAddresses] = useState(getAdrresFromLocal())

  const [selectedAddress, setSelectedAddress] = useState( getCurrentAddres())
  return (
    <>

      <TopBarWithBackButton headerText={'Addresses'}/>
      {console.log(props,"selectedAddress")}
      <Box bg="#f4f4f5" height={"100vh"} >
        {
          addresses.length>0?
        addresses.map((dataKey,index)=>{
            return (
               <Box onClick={()=> {setSelected(index);setSelectedAddress(dataKey) }}> 
              <Addresses
                index={index}
                selected={selected}
                selectedAddress={selectedAddress}
                dataKey={dataKey}
                setAddresses={setAddresses}
               />
              </Box>
            )
          })
       :<> 
       <Flex justifyContent={"center"}  > <Text> No Addresses  </Text></Flex>
         <Flex justifyContent={"center"} alignItems={"center"}>
        <Button onClick={()=>history.push('/create-address')} mt={10} w={"80%"}>CREATE ADDRESS</Button>
        </Flex>
        </> 
        
       } 
       { addresses.length >0 && <ContinueButton onClick={()=>{saveUsersAddress(selectedAddress);history.replace('/cart') }} text = "CONTINUE"/>}

       { addresses.length >0 && <CreateButton />  }
         
     </Box>
    </>
  )
}
function mapStateToProps(state, props) {
  return {
    usersAddress:state.address.address,
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    saveUsersAddress    
  }, dispatch);
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddressListing);
