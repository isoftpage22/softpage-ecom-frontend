import { CUSTOMER_INFO, LOCAL_STORAGE_CUSTOMER_ADDRESS } from "./constants";

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

 export const getUserInFromLocal = ()=>{
  let dataItem =  localStorage.getItem(CUSTOMER_INFO)
  if(dataItem){
     return JSON.parse(dataItem)
  }
  else{
   return []
  } }

 export const createOrderBodyParams = (productList,addToCart,usersAddress,totalCartBill,usersDetailingForOrder,storeDetail,customerInfo)=>{
   let body = {
    industryId:storeDetail.industryId,
    ecommerceId:storeDetail.ecommerceId,
    userId:productList.userId,
    latitude:usersAddress?.latitude??'2302',
    longitude:usersAddress?.longitude??'4302',
    customerAddress1:usersAddress?.customerAddress1??'Lesisure Park',
    customerAddress2:usersAddress?.customerAddress2??'Lesisure Park Face View',
    customerAddressType:usersAddress?.customerAddressType??"Home",
    customerPincode:usersAddress?.customerPincode??201010,
    orderId:"22NOV95",
    paymentStatus:"Pending",
    paymentType:"Online",
    paymentGetaway:"RAZORPAY",
    deliveryType:"Delivery",
    deliveryPartner:"DHL",
    amountPaidbyCustomer:totalCartBill.totalFinalPriceAmount,
    taxAmount:totalCartBill.taxAmount,
    CGST:totalCartBill.CGST,
    SGST:totalCartBill.SGST,
    tipAmount:totalCartBill.tip,
    discountAmount:totalCartBill.discount,
    discountType:totalCartBill.discountType,
    discountRate:totalCartBill.discountRate,
    specialInstructions:usersDetailingForOrder?.specialInstructions??"Nothing",
    orderedProducts:addToCart.products,
    email:'',
    phone:customerInfo?.whatsAppNumber,
    countryCode:customerInfo?.countryCode??91

   
   }

   return body
   
 }






