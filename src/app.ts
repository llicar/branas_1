import express from "express";

import getAccount from "./getAccount"
import signup from "./signup"

const app = express();
app.use(express.json());
app.use(getAccount)
app.use(signup)

app.listen(3000,() =>{
    console.log("Server is running")
});