import React, { Fragment } from "react";
import { Flex, Button } from "@chakra-ui/react";

const ContinueButton = (props) => {
  const { text = "Save address", isDisabled, onClick } = props;
  return (
    <Fragment>
      <Flex
        position="fixed"
        bottom="0"
        left="0"
        w="100%"
        bg="white"
        borderTop="1px solid #EDEDED"
        px="16px"
        py="12px"
        zIndex={15}
        justifyContent="center"
      >
        <Button
          type="button"
          onClick={onClick}
          isDisabled={isDisabled}
          w="100%"
          maxW="520px"
          h="48px"
          bg="#111"
          color="white"
          borderRadius="12px"
          fontSize="15px"
          fontWeight="700"
          textTransform="none"
          letterSpacing="0"
          _hover={{ bg: "#111" }}
          _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
        >
          {text}
        </Button>
      </Flex>
    </Fragment>
  );
};

export default ContinueButton;
