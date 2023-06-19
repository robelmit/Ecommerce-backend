import express from 'express';
const router = express.Router();
import Chat from '../Models/Rooms.js';
import { v4 as uuidv4 } from 'uuid';
import { admin, protect } from "../Middleware/AuthMiddleware.js";




router.get('/', protect, (req, res) => {
  const id = req.user._id
  Chat.find({
    $or: [{ userfrom: id }, { userto: id }]
  }
  ).populate('userfrom').populate('userto').
    then(data => {
      res.json(data)
    }).catch(err => {
      res.status(400).json('this is error');
    })
})
router.post('/', (req, res) => {
  if ((req.body.userfrom && req.body.userto) && (req.body.userfrom != req.body.userto)) {
    Chat.find({
      $or: [{ userfrom: req.body.userfrom, userto: req.body.userto }, { userfrom: req.body.userto, userto: req.body.userfrom }]
    }
    ).then(rooms => {
      if (rooms.length > 0) {
        res.status(400).json("room already created ")
      }
      else {
        const chat = new Chat({
          userfrom: req.body.userfrom,
          userto: req.body.userto,
          roomid: uuidv4(),
        });
        console.log(chat);
        chat
          .save()
          .then(res.json({ message: 'room created  successfully' }))
          .catch((err) => {
            res.json(err);
          });
      }
      //res.json(data)
    }).catch(err => {
      // res.json('this is error');
    })

  }
  else res.status(400).json('room can not be created')
});

export default router;
