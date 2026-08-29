import CommonTopBar from './CommonTopBar';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
// import { needGuestCartSyncStart, needGuestCartSyncReset } from '../../../Store/action/login';
// import { addToCartSaveOnCheckout, getProductList } from '../../../Store/action/product';


function mapStateToProps(state, props) {
  return {
    addToCart: state.shoppingCart.addToCart,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
 
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommonTopBar);
