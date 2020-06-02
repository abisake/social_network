import { REGISTER_SUCCESS, REGISTER_FAIL } from "../actions/types";

const initialState = {
	token: localStorage.getItem("token"),
	isAuthenticated: null,
	loading: true,
	user: null,
};

export default (state = initialState, action) => {
	const { type, payload } = action; // destructuring

	switch (type) {
		case REGISTER_SUCCESS:
			localStorage.setItem("token", payload.token); // assigning the local variable's value
			// as payload's token value
			return {
				...state, // copying entire state value,as its immutable
				...payload, // copying entire payload values
				isAuthenticated: true,
				loading: false,
			};
		case REGISTER_FAIL:
			localStorage.removeItem("token"); //removing the token value
			return {
				...state,
				token: null, //assigning the token value as null
				isAuthenticated: false,
				loading: false,
			};
		default:
			return state;
	}
};
