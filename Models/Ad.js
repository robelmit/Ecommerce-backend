import mongoose from "mongoose";
const LocationSchema = mongoose.Schema({
  type: {
    type: String,
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    index: "2dsphere"
  }
})
//LocationSchema.index({ location: "2dsphere" });

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
    city: {
      type: String,
    },
    price: {
      type: String,
      required: true,
    },
    location: LocationSchema,
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

Adschema.index({ location: "2dsphere" })

const User = mongoose.model("Ads", Adschema);

export default User;
