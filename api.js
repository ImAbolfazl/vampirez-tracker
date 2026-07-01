import axios from "axios"
import express from "express"
import cors from "cors"

const app = express()
const PORT = process.env.PORT

let currentPlayers = ""

app.use(cors({
    origin:"*",
    methods:"*"
}))
app.use(express.json())

async function fetchData() {
    try{
        const response = await axios({
            method: "get",
            url: "https://api.hypixel.net/v2/counts",
            headers: {
                "API-Key": process.env.HYPIXEL_API_KEY
            }
        })

        if(response){
            return response.data
        }
    }catch(err){console.log(err)}
}

setInterval(async () => {
    currentPlayers = await fetchData()
}, 5000)

app.get("/counts", (req, res) => {
    res.json(currentPlayers)
})

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})