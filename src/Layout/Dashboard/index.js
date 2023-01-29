import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import Dashboard from './Dashboard';

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
)(Dashboard);

