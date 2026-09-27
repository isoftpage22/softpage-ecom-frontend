import { CUSTOMER_INFO, LOCAL_STORAGE_CUSTOMER_ADDRESS, SELECTED_CUSTOMER_ADDRESS, STORE_INFO } from "./constants";
import { buildCheckoutNotes, getTableSession } from "@/lib/restaurant/table-session";

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
function addressFingerprint(row = {}) {
  return [
    row.houseNumber,
    row.floor,
    row.tower,
    row.societyName,
    row.pincode || row.postalCode,
    row.address1 || row.line1,
  ]
    .map((part) => String(part || "").trim().toLowerCase())
    .join("|");
}

export const persistSelectedAddress = (address) => {
  if (typeof window === "undefined" || !address || typeof address !== "object") return;
  try {
    localStorage.setItem(SELECTED_CUSTOMER_ADDRESS, JSON.stringify(address));
  } catch {
    /* ignore */
  }
};

export const getAdrresFromLocal = ()=>{
  if (typeof window === "undefined") return [];
  let dataItem =  localStorage.getItem(LOCAL_STORAGE_CUSTOMER_ADDRESS)
    if(dataItem){
       try {
         const parsed = JSON.parse(dataItem)
         return Array.isArray(parsed) ? parsed : []
       } catch {
         return []
       }
    }
    else{
     return []
    }
 }

export const upsertLocalAddress = (payload) => {
  const list = getAdrresFromLocal();
  const fingerprint = addressFingerprint(payload);
  const index = list.findIndex((row) => {
    if (payload?.serverId && row?.serverId && Number(row.serverId) === Number(payload.serverId)) return true;
    if (payload?.id != null && row?.id != null && String(row.id) === String(payload.id)) return true;
    return addressFingerprint(row) === fingerprint;
  });
  if (index >= 0) list[index] = { ...list[index], ...payload };
  else list.unshift(payload);
  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOMER_ADDRESS, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  persistSelectedAddress(payload);
  return list;
};

 export const getCurrentAddres = ()=>{
    if (typeof window !== "undefined") {
      try {
        const selected = localStorage.getItem(SELECTED_CUSTOMER_ADDRESS);
        if (selected) {
          const parsed = JSON.parse(selected);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed;
          }
        }
      } catch {
        /* fall through */
      }
    }
    const list = getAdrresFromLocal();
    return list[0] || {};
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
  if (typeof window === "undefined") return [];
  let dataItem =  localStorage.getItem(CUSTOMER_INFO)
  if(dataItem){
     return JSON.parse(dataItem)
  }
  else{
   return []
  } }
  export const getStoreInfoFromLocal = ()=>{
    if (typeof window === "undefined") return {};
    let dataItem =  localStorage.getItem(STORE_INFO)
    if(dataItem){
       return JSON.parse(dataItem)
    }
    else{
     return {}
    } }

 export const createOrderBodyParams = (productList,addToCart,usersAddress,totalCartBill,usersDetailingForOrder,storeDetail,customerInfo)=>{
   const notes = buildCheckoutNotes(
     getTableSession(),
     usersDetailingForOrder?.specialInstructions
   );
   let body = {
    industryId:storeDetail?.industryId || storeDetail?.businessId,
    ecommerceId:storeDetail?.ecommerceId || storeDetail?.businessAppId,
    userId:productList.userId,
    latitude: usersAddress?.latitude,
    longitude: usersAddress?.longitude,
    customerAddress1: usersAddress?.customerAddress1 || usersAddress?.address1,
    customerAddress2: usersAddress?.customerAddress2 || usersAddress?.address2,
    customerAddressType: usersAddress?.customerAddressType || usersAddress?.checkbox || "Home",
    customerPincode: usersAddress?.customerPincode || usersAddress?.pincode,
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
    specialInstructions: notes || usersDetailingForOrder?.specialInstructions || "Nothing",
    orderedProducts:addToCart.products,
    email:'',
    phone:customerInfo?.whatsAppNumber,
    countryCode:customerInfo?.countryCode??91

   
   }

   return body
   
 }






