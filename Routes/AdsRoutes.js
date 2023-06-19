import express from "express";
import asyncHandler from "express-async-handler";
import Ads from "./../Models/Ad.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import multer from 'multer';
import path from 'path';
import { log } from "console";
const Adsrouter = express.Router();
var storage = multer.diskStorage({
  destination: 'images',
  // function(req, file, cb) {
  //   cb(null, path.join('D:', 'desta', '/server'));
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
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const { catagory } = req.body
    const keyword = req.query.keyword
      ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};
    const count = await Ads.countDocuments({ ...keyword });
    const products = await Ads.find({ ...keyword })
      // .limit(pageSize)
      // .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json(products);
    // res.json({ products, page, pages: Math.ceil(count / pageSize) });
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
    const product = await Ads.findById(req.params.id);
    if (product) {
      await product.remove();
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
      imagepro.push({ url: 'http://192.168.43.34:5000/' + req.files[i].filename, isprimary: istrue });
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
        price

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
export default Adsrouter;







// this is the cool thing