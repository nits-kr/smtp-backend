const { ref } = require("joi");
const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  actions: [{ type: String, required: true }],
});

const userSchema = new mongoose.Schema(
  {
    parentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    role: { type: String, enum: ["ADMIN", "SUB_USER"], default: "SUB_USER" },
    permissions: [permissionSchema],
    isEmailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
