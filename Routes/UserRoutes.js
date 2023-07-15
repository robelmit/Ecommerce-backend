import express from "express";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import generateToken from "../utils/generateToken.js";
import User from "./../Models/User.js";
import nearbyCities from "nearby-cities"


const userRouter = express.Router();

// LOGIN
userRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber });
    console.log(user)
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  })
);

// REGISTER
userRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, phoneNumber, email, password } = req.body;
    console.log(req.body);
    console.log(phoneNumber);
    console.log(email);
    console.log(password);

    const userExists = await User.findOne({ phoneNumber });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid User Data");
    }
  })
);

// PROFILE
userRouter.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);
userRouter.get(
  "/user/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        phoneNumber: user.phoneNumber,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);
userRouter.delete(
  "/user/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (user) {
      res.json({
        message: "User Successfully deleted"
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// UPDATE PROFILE
userRouter.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// GET ALL USER ADMIN
userRouter.get(
  "/oll",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    console.log(req.query.keyword);
    const keyword = req.query.keyword
      ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};

    const count = await User.countDocuments({ ...keyword });
    const users = await User.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json({ users, page, pages: Math.ceil(count / pageSize) });
  })
);

userRouter.post('/favourites',
  protect,
  async (req, res) => {
    //     var John = people.findOne({name: "John"});
    // John.friends.push({firstName: "Harry", lastName: "Potter"});
    // John.save();
    let { favourite } = req.body
    var user = await User.find({ _id: req.user });
    console.log(user);
    console.log(user[0].favourites);
    user[0].favourites.push(favourite)
    user[0].save()
    res.json(

      user[0].favourites
    );

  })
userRouter.post('/location',
  protect,
  async (req, res) => {
    //     var John = people.findOne({name: "John"});
    // John.friends.push({firstName: "Harry", lastName: "Potter"});
    // John.save();
    let { latitude, longitude } = req.body
    var user = await User.findOne({ _id: req.user });
    console.log(user);
    user.location = {
      type: 'Point',
      coordinates: [latitude, longitude]
    }
    const query = { latitude: 13.4974017, longitude: 39.4707367 }
    const cities = nearbyCities(query)
    user.city = cities[0].name ? cities[0].name : "Mekelle"
    user.save()
    res.json(
      user
    );

  })
userRouter.get('/favourites',
  protect,
  async (req, res) => {
    const user = await User.find({ _id: req.user }).populate('favourites')

    res.json(user[0].favourites)
  })
userRouter.delete('/favourites',
  protect,
  async (req, res) => {
    const user = await User.find({});

  })

export default userRouter;
