// const { MongoClient } = require('mongodb')
// const { connectToDb, getDb } = require('./db')
// let db
// const defaultValue = ""
// connectToDb((err) => {
//   if (!err) {
//     console.log("db connected")  
//     db = getDb();
//   }
//   else{
//     console.log("db error",err)  
//   }

// })

const mongoose = require("mongoose")
const Document = require("./Document")

mongoose.connect('mongodb://127.0.0.1/CSEA-Google-Docs-Clone');

const io = require("socket.io")(3001, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
})

  const defaultValue = ""

io.on("connection", socket => {
    socket.on("get-document", async documentId => {
      const document = await findOrCreateDocument(documentId)
      socket.join(documentId)
      socket.emit("load-document", document.data)
  
      socket.on("send-changes", delta => {
        socket.broadcast.to(documentId).emit("receive-changes", delta)
      })

      socket.on("save-document", async data => {
        await Document.findByIdAndUpdate(documentId, { data })
      })
    })
})

async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
  }