import React from 'react';
import './loader-styles.css'
import { Text } from '@chakra-ui/react';
const Loader = ({ isloading }) => {
    if (!isloading) return null;
    return (
        <div className="loader" style={{ display: "block" }}>
            <div className="loader-container">
            <div className="spinner mb-2">
            </div>
            <Text as="span" color={"white"}>Loading... Please wait</Text>
            </div>
        </div>
    );
}

export default Loader;
