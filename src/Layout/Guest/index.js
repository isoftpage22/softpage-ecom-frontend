import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import Guest from './Guest';
import { get as _get } from "lodash";
// import { getProductList ,getSearchProductList, resetSearchProductList} from '../../Store/action/product'
// import { showToastMessage, setStartLoader, setStopLoader, resetToastMessage } from '../../Store/action/loader'
// import { getUserProfile, clearCartData,logoutUser,resetUserProfile } from '../../Store/action/user'
// import {  getUserCartDetails } from '../../Store/action/product';

// import { openLogin, closeLogin,openSignup } from '../../Store/action/login'
// import { getDeliveryRange,openFinetuneLocation,closeFinetuneLocation,openLocation } from '../../Store/action/location'

function mapStateToProps(state, props) {
    return {
    
        
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
       
    }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Guest);

