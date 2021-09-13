import mongoose from "mongoose";

const subSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrn: {
      type: String,
      default: "",
    },
    bannerUrn: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    },
    bannerUrl: {
      type: String,
      default: ''
    },
    user: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

const Sub = mongoose.model("Sub", subSchema);

export default Sub;
