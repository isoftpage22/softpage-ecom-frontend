import React from 'react';
import './loader-styles.css'
import { Text } from '@chakra-ui/react';
const Loader = ({ isloading }) => {
    return (
        <div className="loader" style={{ display: isloading ? "block" : "none" }}>
            <div className="loader-container">
             
            <div class="spinner mb-2">
            </div>
            <Text color={"white"}>Loading... Please wait</Text>

            </div>

        </div>
    );
}

export default Loader;
