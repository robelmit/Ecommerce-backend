const express = require('express');
const router = express.Router();
const Notification = require('../Models/notification');

router.get('/:id', (req, res) => {
  Notification.find({ userto: req.params.id })
    .populate('userfrom')
    .populate('userto')
    .then((data) => {
      res.json(data);
    });
});
router.post('/note', (req, res) => {
  const Notification = new Notification({
    userfrom: req.body.userfrom,
    userto: req.body.userto,
    notification: req.body.notification,
    type: req.body.type,
  });
  Notification.save()
    .then(res.json({ message: 'Notification saved successfully' }))
    .catch((err) => {
      res.json(err);
    });
});

module.exports = router;
