import "dotenv/config"
import connectDB from "./db/connectDB.js";
import app from "./app.js";
connectDB()
    .then(() => {
        const port=process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`App listening on port ${port}`)
        })
    })
    .catch(error=>console.log("ERROR:>>",  error));