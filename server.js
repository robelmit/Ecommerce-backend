import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/MongoDb.js";
//import ImportData from "./DataImport.js";
//import productRoute from "./Routes/ProductRoutes.js";
import { errorHandler, notFound } from "./Middleware/Errors.js";
import userRouter from "./Routes/UserRoutes.js";
import Adsrouter from "./Routes/AdsRoutes.js";
import Roomrouter from "./Routes/Rooms.js";
import Messagerouter from "./Routes/Message.js";
import morgan from 'morgan';
import cors from 'cors'
import path from 'path'
import { Server } from 'socket.io'
import { createServer } from 'http';
import Message from './Models/Message.js'
import { log } from "console";
import { protect, admin } from "./Middleware/AuthMiddleware.js";
//import Chat from './Models/Chats.js'




dotenv.config();
connectDatabase();
const app = express();
const httpServer = createServer(app);


const io = new Server(httpServer, {
    allowEIO3: true,
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
app.use(cors())
app.use(morgan('tiny'))


app.use(express.json());



// API
app.use(express.static(path.join('D:', 'desta', 'server', 'images')));
app.get('/', protect, admin, (req, res) => { res.json(req.user) })

app.use("/api/users", userRouter);
app.use("/api/adds", Adsrouter);
app.use("/api/rooms", Roomrouter);
app.use("/api/messages", Messagerouter);
// ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// io.use(async (socket, next) => {
//     try {
//         const token = socket.handshake.query.token;
//         const payload = await jwt.verify(token, process.env.SECRET);
//         socket.userId = payload.id;
//         next();
//     } catch (err) { }
// });

io.on("connection", (socket) => {
    console.log("Connected: " + socket.userId);

    socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.userId);
    });

    socket.on("joinRoom", (roomid) => {
        socket.join(roomid);
        console.log("A user joined chatroom: " + roomid);
    });

    socket.on("leaveRoom", ({ roomid }) => {
        socket.leave(roomid);
        console.log("A user left chatroom: " + chatroomId);
    });

    socket.on("chatroomMessage", async ({ roomid, textmessage, userfrom, userto, }) => {
        if (textmessage.trim().length > 0) {
            //  const user = await User.findOne({ _id: socket.userId });
            const newMessage = new Message({
                userfrom,
                userto,
                roomid,
                textmessage,
            });
            await newMessage.save();
            Message.populate(newMessage, { path: "userfrom" }, function (err, ms) {
                Message.populate(newMessage, { path: "userto" }, function (err, finalms) {
                    io.to(roomid).emit("newMessage", finalms);
                    console.log(finalms);
                })
            })
            // newMessage.pop
        }
    });
});

httpServer.listen(PORT, console.log(`server run in port ${PORT}`));
