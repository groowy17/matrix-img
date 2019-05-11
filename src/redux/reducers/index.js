import { SET_ACTIVE_CARD } from "../actions";

const initialState = {
  active: false,
  number: 0,
  row: 0
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ACTIVE_CARD:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

export default rootReducer;
