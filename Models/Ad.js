import mongoose from "mongoose";

const Adschema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,

    },
    images: [
      {
        url: { type: String, required: true },
        isprimary: { type: Boolean, required: true },
      }
    ],

    catagory: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    favourites: [
      {
        add: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ads"
        }
      }
    ]

  },
  {
    timestamps: true,
  }
);

// Login


const User = mongoose.model("Ads", Adschema);

export default User;
