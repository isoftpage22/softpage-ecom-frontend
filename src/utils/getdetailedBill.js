export const getDetailBill = (_addToCart,discType='percentage',discountVal=18,tip=0,deliveryFee=0)=>{

    let discountRate = discountVal
    let discountType = discType
    const getDiscount = (discType, disc, totalAmount) => {
       
      if (discType == 'percentage') {
        return Math.floor((totalAmount * disc)/100)
      } else {
        return Math.floor(totalAmount - disc)

      }
    }
    let totalAmount = _addToCart.products.reduce((total, item) => { 
       
      return Math.ceil( total + item.total_amount)
    },0)
    let priceAfterDiscount = Math.ceil(totalAmount - getDiscount(discountType, discountRate, totalAmount))
    let taxAmount = getDiscount('percentage', 18, priceAfterDiscount)
    const shipping = Math.max(0, Number(deliveryFee) || 0)
    let totalFinalPriceAmount =  priceAfterDiscount + taxAmount + tip + shipping
    
     return{
        qty: _addToCart.products.length,
        totalAmount: totalAmount,
        discountType: discountType,
        discountRate: discountRate,
        discount: getDiscount(discountType, discountRate, totalAmount),
        priceAfterDiscount: priceAfterDiscount,
        taxAmount : taxAmount,
        CGST:Math.round(taxAmount/2),
        SGST:Math.round(taxAmount/2),
        tip:tip,
        deliveryFee: shipping,
        totalFinalPriceAmount : totalFinalPriceAmount
     }
  
}