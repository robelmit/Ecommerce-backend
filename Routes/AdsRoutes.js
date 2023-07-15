import express from "express";
import asyncHandler from "express-async-handler";
import Ads from "./../Models/Ad.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import multer from 'multer';
import path from 'path';
import { log } from "console";
import User from "../Models/User.js";
import moment from 'moment'
const Adsrouter = express.Router();
var storage = multer.diskStorage({
  destination: 'images',
  // function(req, file, cb) {
  //   cb(null, path.join('D:', 'desta', '/server'));
  // },
  // },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
  }

});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 20000000
  },
  // fileFilter(req, file, cb) {
  //   if (!file.originalname.match(/\.(png|jpg)$/)) {
  //     return cb(new Error('please upload images'));

  //   }
  //   cb(undefined, true);
  // },
});


// GET ALL PRODUCT
Adsrouter.get(
  "/",

  asyncHandler(async (req, res) => {
    const pageSize = 6;
    const page = Number(req.query.pageNumber) || 1;
    const { catagory } = req.body
    const { distance } = req.body
    const { tags, longitude, latitude } = req.body
    const keyword = req.query.keyword
      ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};

    var counter;
    if (tags && distance && longitude && latitude) {
      console.log('we are hitting here');
      if (req.query.keyword) {
        console.log('nice');
        counter = await Ads.find({
          ...keyword,
          catagory: { $in: tags },
          location: {
            $near: {
              $maxDistance: distance * 1000,
              // distance in meters
              $geometry: {
                type: 'Point',
                coordinates: [latitude, longitude]

              }
            }
          }
        });
      }
      else {
        console.log('bro');
        counter = await Ads.find({
          catagory: { $in: tags },
          location: {
            $near: {
              $maxDistance: distance * 1000,
              // distance in meters
              $geometry: {
                type: 'Point',
                coordinates: [latitude, longitude]

              }
            }
          }
        });
      }

      const adds = await Ads.find({
        ...keyword,
        catagory: { $in: tags },
        location: {
          $near: {
            $maxDistance: distance * 1000,
            // distance in meters
            $geometry: {
              type: 'Point',
              coordinates: [latitude, longitude]

            }
          }
        }
      })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ _id: -1 });
      //res.json(adds);
      console.log(counter)
      console.log('counter')
      res.json({ adds: adds ? adds : [], page, pages: Math.ceil((counter ? counter.length : 0) / pageSize) ? Math.ceil((counter ? counter.length : 0) / pageSize) : 0 });
    }
    else if (tags && !distance && !longitude && !latitude) {
      var countproitem;

      if (req.query.keyword) {
        countproitem = await Ads.countDocuments({ ...keyword, catagory: { $in: tags }, });
      }
      else {
        countproitem = await Ads.countDocuments({ ...keyword, catagory: { $in: tags }, });
      }
      const adds = await Ads.find({ ...keyword, catagory: { $in: tags }, })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ _id: -1 });
      //res.json(adds);

      res.json({ adds, page, pages: Math.ceil(countproitem / pageSize) });
    }
    else {
      var countpro;

      if (req.query.keyword) {
        countpro = await Ads.countDocuments({ ...keyword });
      }
      else {
        countpro = await Ads.countDocuments();
      }
      const adds = await Ads.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ _id: -1 });
      //res.json(adds);

      res.json({ adds, page, pages: Math.ceil(countpro / pageSize) });
    }


  })
);
Adsrouter.get(
  "/oll",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};
    const count = await Ads.countDocuments({ ...keyword });
    const adds = await Ads.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json({ adds, page, pages: Math.ceil(count / pageSize) });
  })
);

Adsrouter.get(
  "/catagory",
  //protect,
  asyncHandler(async (req, res) => {
    // const pageSize = 12;
    // const page = Number(req.query.pageNumber) || 1;
    const catagory = req.query.catagory
    //   console.log(catagory)
    const keyword = {
      catagory,
    }

    const count = await Ads.countDocuments({ ...keyword });
    const ads = await Ads.find({ ...keyword })
      // .limit(pageSize)
      // .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json(ads);
    // res.json({ products, page, pages: Math.ceil(count / pageSize) });
  })
);

// ADMIN GET ALL PRODUCT WITHOUT SEARCH AND PEGINATION
Adsrouter.get(
  "/all",
  protect,
  // admin,
  asyncHandler(async (req, res) => {
    const products = await Ads.find({}).sort({ _id: -1 });
    res.json(products);
  })
);

// GET SINGLE PRODUCT
Adsrouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Ads.findOne({ _id: req.params.id }).populate('postedBy')
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("ad  not Found");
    }
  })
);


// PRODUCT REVIEW
Adsrouter.post(
  "/:id/review",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Ads.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already Reviewed");
      }
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Reviewed Added" });
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);

// DELETE PRODUCT
Adsrouter.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Ads.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: "Product deleted" });
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);

Adsrouter.post(
  "/image",
  upload.array('image', 5),
  (req, res) => {
    let imagepro = []
    let istrue = true;
    for (let i = 0; i < req.files.length; i++) {
      imagepro.push({ url: process.env.SERVERURL + req.files[i].filename, isprimary: istrue });
      istrue = false
    }
    //console.log(imagepro)
    console.log(req.files)
    res.json(imagepro)
  }
);
// CREATE PRODUCT
Adsrouter.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {


    const { title, images, description, catagory, price } = req.body;

    console.log(images);
    const productExist = await Ads.findOne({ title });
    if (productExist) {
      res.status(400);
      throw new Error("Ads name already exist");
    } else {
      const ad = new Ads({
        title,
        images,
        description,
        catagory,
        postedBy: req.user._id,
        price,
        location: req.user.location,
        city: req.user.city

      });
      if (ad) {
        const createdproduct = await ad.save();
        res.status(201).json(createdproduct);
      } else {
        res.status(400);
        throw new Error("Invalid product data");
      }
    }
  })
);

// UPDATE PRODUCT
Adsrouter.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { title, images, description, catagory, postedBy, price } = req.body;
    const ad = await Ads.findById(req.params.id);
    if (ad) {
      ad.title = title || ad.title;
      ad.price = price || ad.price;
      ad.description = description || ad.description;
      ad.images = images || ad.images;
      ad.catagory = catagory || ad.catagory;
      ad.price = price || ad.price;

      const Updatedad = await ad.save();
      res.json(Updatedad);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  })
);


Adsrouter.get('/all/dashboared', async (req, res) => {
  const adds = await Ads.countDocuments();
  const users = await User.countDocuments();
  var todaystart = moment().startOf('day');
  // end today
  var thismonthstart = moment().startOf('month');   // set to the first of this month, 12:00 am
  var thisyearstart = moment().startOf('year');   // set to the first of this month, 12:00 am
  var thisweekstart = moment().startOf('week');
  var end = moment(todaystart).endOf('day');

  const todayadd = await Ads.find({ createdAt: { '$gte': todaystart, '$lte': end } })
  const thisweekadd = await Ads.find({ createdAt: { '$gte': thisweekstart, '$lte': end } })
  const thismonthadd = await Ads.find({ createdAt: { '$gte': thismonthstart, '$lte': end } })
  const todayuser = await User.find({ createdAt: { '$gte': todaystart, '$lte': end } })
  const thisweekuser = await User.find({ createdAt: { '$gte': thisweekstart, '$lte': end } })
  const thismonthuser = await User.find({ createdAt: { '$gte': thismonthstart, '$lte': end } })
  const thisyearuser = await User.find({ createdAt: { '$gte': thisyearstart, '$lte': end } })
  //users,
  //adds,
  if (users) {
    res.json({
      users,
      adds,
      todayadd,
      thisweekadd,
      thismonthadd,
      todayuser,
      thisweekuser,
      thismonthuser,
      thisyearuser
    })
  }
  else {

    res.status(404).json({
      message: "Error on sending"
    })
  }
})
export default Adsrouter;







// this is the cool thing