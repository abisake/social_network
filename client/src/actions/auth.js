import axios from "axios";

import { setAlert } from "./alert"; // for showing alert messages for each alert
import { REGISTER_SUCCESS, REGISTER_FAIL } from "./types";

//Register a user by verifying email,name, password

export const register = ({ name, email, password }) => async (dispatch) => {
	const config = {
		header: {
			"Content-Type": "application/json",
		},
	}; // creating a config variable,which will be sent to url,as a request

	const body = JSON.stringify({ name, email, password });
	// converting the values into JSON
	try {
		const res = await axios.post("/api/user", body, config);
		//sending a request
		dispatch({
			type: REGISTER_SUCCESS,
			payload: res.data,
		});
	} catch (err) {
		const errors = err.response.data.errors;
		//creating an variable and storing all the errors.
		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
		}

		dispatch({
			type: REGISTER_FAIL,
		});
	}
};
