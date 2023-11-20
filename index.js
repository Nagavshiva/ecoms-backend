const express = require('express');
const Mongodb = require("./config/db");
const usersRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const seedRouter = require("./routes/seedRoute");
const cors = require("cors");
const dotnev = require("dotenv");


const app = express();

dotnev.config();

// Middleware
app.use(express.json());
app.use(cors())

//Database
Mongodb();



//Routes
app.use("/api/seeder",seedRouter)
app.use("/api/users",usersRoutes);
app.use("/api/product",productRoutes)


// Server
const PORT =  process.env.PORT || 5000;
app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));