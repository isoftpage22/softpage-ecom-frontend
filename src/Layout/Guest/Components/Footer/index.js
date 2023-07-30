
import Footer from './Footer';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
// import { getBannerList } from '../../Store/action/banner';

// import { openLocation } from '../../Store/action/location';
// import { downloadAppLink } from '../../Store/action/downloadApp';
// import { showToastMessage, resetToastMessage } from '../../Store/action/loader';

function mapStateToProps(state, props) {
    return {
        addToCart:state.shoppingCart.addToCart
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
            
    }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Footer);
