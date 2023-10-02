import React,{Fragment} from 'react'
import { Box,Button,Flex,Text,Icon } from '@chakra-ui/react'
import { MdAddCircle } from "react-icons/md";
import { Link } from 'react-router-dom';

const CreateButton = (props) => {
  return (
    <>
       <Fragment>
        <Link to="/create-address">
        <Flex justifyContent={"flex-end"}>
          <Flex color="black" justifyContent="center" alignItems={"center"} position="fixed" bottom="80px" borderRadius={12} >
            <Flex px="10px" color="white" justifyContent="flex-end" alignItems="center" w="100%" h="100%" >
            <Icon  color={'#f4c359'} h={"50px"} mt={2} w={"50px"} as={MdAddCircle} />
            </Flex>
          </Flex>
        </Flex>
        </Link>
      </Fragment>
    </>
  )
}

export default CreateButton