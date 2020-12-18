const express = require("express")
const cors = require("cors")
const listEndpoints = require("express-list-endpoints")
// const helmet = require("helmet")


const mediaRoutes = require("./services/media")

const {
    notFoundHandler,
    unauthorizedHandler,
    forbiddenHandler,
    catchAllHandler,
  } = require("./errorHandlers")
  


const server = express()

const port = process.env.PORT || 3001

server.use(express.json())

// server.use(helmet())
server.use(cors())

server.use("/media",mediaRoutes)



server.use(notFoundHandler)
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

console.log(listEndpoints(server))

server.listen(port,()=>{
    console.log("its just the start")
})
