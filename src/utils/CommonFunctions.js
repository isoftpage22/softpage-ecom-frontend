import { LOCAL_STORAGE_CUSTOMER_ADDRESS } from "./constants";

const usedValues = [];

// Function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }

  return result;
}

// Function to generate a unique random alphanumeric string of a given length
export function generateUniqueRandomString(length=10) {
  let value;
  
  // Generate a random value until it's unique
  do {
    value = generateRandomString(length);
  } while (usedValues.includes(value));

  // Add the generated value to the list
  usedValues.push(value);

  return value;
}

// Usage example to generate a unique 10-digit random alphanumeric string
export const getAdrresFromLocal = ()=>{
  let dataItem =  localStorage.getItem(LOCAL_STORAGE_CUSTOMER_ADDRESS)
    if(dataItem){
       return JSON.parse(dataItem)
    }
    else{
     return []
    }
 }
 export const getCurrentAddres = ()=>{
    if(getAdrresFromLocal().length>0){
       return getAdrresFromLocal()[0]
    }
    else{
     return {}
    }
 }
 export const getAddressOnBasisOfId = (id)=>{
  try {
    let addresses = getAdrresFromLocal()
    let filterOutaddress =  addresses.filter((dataKey,index)=>dataKey.id == id)
   return filterOutaddress[0]
  } catch (error) {
    console.log(error)
  }
   
 }






