import {
TOGGLE_USER_FORM_DRAWER,
} from "../actionTypes";
const INITIAL_STATE = {
  userFormDrawerStatus: false,
};
const modalsNDrawers = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TOGGLE_USER_FORM_DRAWER:
      return {
        ...state,
        userFormDrawerStatus: action.payload,
      };
   

    default:
      return state
  }

}
export default modalsNDrawers;