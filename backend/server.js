import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";

import { connectDB } from "./lib/db.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());    //allows you to parse the body of the request
app.use(cookieParser());


// console.log(process.env.PORT);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);

app.listen(5000, () => {
    console.log("Server is running on http://localhost: " + PORT);
    connectDB();
})












// "test": "echo \"Error: no test specified\" && exit 1"
