import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { get as _get } from "lodash";
import UserProfile from './UserProfile';

// import { getProductList ,getSearchProductList, resetSearchProductList} from '../../Store/action/product'
// import { showToastMessage, setStartLoader, setStopLoader, resetToastMessage } from '../../Store/action/loader'
// import { openLogin, closeLogin } from '../../Store/action/login';
// import { logoutUser,resetUserProfile,clearCartData } from '../../Store/action/user'

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
)(UserProfile);

