const express = require("express");
const connectDb = require("./config/db");

const app = express();

connectDb(); // db connection

//Init Middleware
app.use(
	express.json({
		extended: false,
	}),
);

app.get("/", (req, res) => {
	res.send("Api Running");
});

//Defining Routes
app.use("/api/users", require("./routes/api/user")); // user route
app.use("/api/auth", require("./routes/api/auth")); // auth route
app.use("/api/profile", require("./routes/api/profile")); // profile route
app.use("/api/posts", require("./routes/api/posts")); // posts route

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started in PORT ${PORT}`));
