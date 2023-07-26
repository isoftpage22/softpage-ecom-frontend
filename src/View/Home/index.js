import Home from './Home';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
// import { getBannerList } from '../../Store/action/banner';
import {getProductsList } from '../../Store/action/products';
// import { openLocation } from '../../Store/action/location';
// import { downloadAppLink } from '../../Store/action/downloadApp';
// import { showToastMessage, resetToastMessage } from '../../Store/action/loader';

function mapStateToProps(state, props) {
    console.log("mapStateToProps",state)
    return {
        productList:state.products.productList
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getProductsList
    }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
