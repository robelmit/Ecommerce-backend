import express from 'express';
const router = express.Router();
import Message from '../Models/Message.js';
import Chat from '../Models/Rooms.js';
import { v4 as uuidv4 } from 'uuid';




router.get('/:roomid', (req, res) => {

    Message.find({ roomid: req.params.roomid }
    ).populate('userfrom').populate('userto').
        then(message => {
            res.json(message)
        }).catch(err => {
            res.status(400).json('this is error');
        })
})
router.post('/', async (req, res) => {
    console.log('correct');
    const { userfrom, userto, roomid, textmessage } = req.body
    const msg = new Message({
        userfrom, userto, roomid, textmessage
    })
    console.log(msg);
    await msg.save()
    res.json(msg)
});

export default router;
