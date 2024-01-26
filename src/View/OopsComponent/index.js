import OopsComponent from './OopsComponent';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
// import { getBannerList } from '../../Store/action/banner';
import {getProductsList } from '../../Store/action/products';
import {addToCartProduct,deleteToCartProduct } from '../../Store/action/shoppingCart';
import {toggleUserFormDrawer } from '../../Store/action/modalsNDrawers';
import {setLoader } from '../../Store/action/loader';

// import { openLocation } from '../../Store/action/location';
// import { downloadAppLink } from '../../Store/action/downloadApp';
// import { showToastMessage, resetToastMessage } from '../../Store/action/loader';

function mapStateToProps(state, props) {
    console.log(state,"state")
    return {
      



    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
       
        setLoader
        
    }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OopsComponent);
