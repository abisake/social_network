import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// destructuring props.alerts into alerts
const Alert = ({ alerts }) =>
	alerts !== null &&
	alerts.length > 0 &&
	alerts.map((alert) => (
		<div key={alert.id} className={`alert alert-${alert.alertType}`}>
			{alert.msg}
		</div>
	));

Alert.propTypes = {
	alerts: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
	//we are mapping the state to this component.
	alerts: state.alert, // displaying the message
});

export default connect(mapStateToProps)(Alert);
