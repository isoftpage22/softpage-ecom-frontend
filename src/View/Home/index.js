import Home from './Home';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
// import { getBannerList } from '../../Store/action/banner';
import {getProductsList } from '../../Store/action/products';
import {addToCartProduct,deleteToCartProduct } from '../../Store/action/shoppingCart';
import {toggleUserFormDrawer } from '../../Store/action/modalsNDrawers';
import { setLoader } from '../../Store/action/loader';
import { emptyOrderPaymentStatuses } from '../../Store/action/orders';

// import { openLocation } from '../../Store/action/location';
// import { downloadAppLink } from '../../Store/action/downloadApp';
// import { showToastMessage, resetToastMessage } from '../../Store/action/loader';

function mapStateToProps(state, props) {
    return {
        productList:state.products.productList,
        addToCart:state.shoppingCart.addToCart,
        detailedBill:state.shoppingCart.detailedBill,
        userFormDrawerStatus:state.modalsNDrawers.userFormDrawerStatus,
        usersAddress:state.address.address,



    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getProductsList,
        addToCartProduct,
        deleteToCartProduct,
        toggleUserFormDrawer,
        setLoader,
        emptyOrderPaymentStatuses
        
    }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
