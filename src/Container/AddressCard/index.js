import AddressCard from './AddressCard';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
// import { getBannerList } from '../../Store/action/banner';
import {getProductsList } from '../../Store/action/products';
import {addToCartProduct,deleteToCartProduct } from '../../Store/action/shoppingCart';
import {toggleUserFormDrawer } from '../../Store/action/modalsNDrawers';

// import { openLocation } from '../../Store/action/location';
// import { downloadAppLink } from '../../Store/action/downloadApp';
// import { showToastMessage, resetToastMessage } from '../../Store/action/loader';

function mapStateToProps(state, props) {
    return {
        productList:state.products.productList,
        addToCart:state.shoppingCart.addToCart,
        detailedBill:state.shoppingCart.detailedBill,
        userFormDrawerStatus:state.modalsNDrawers.userFormDrawerStatus


    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getProductsList,
        addToCartProduct,
        deleteToCartProduct,
        toggleUserFormDrawer
        
    }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddressCard);
