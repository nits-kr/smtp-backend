const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createSubUser = async (req, res) => {
  const { name, email, password, permissions, parentUserId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const subUser = await User.create({
    parentUser: req.user.id,
    name,
    email,
    password: hashedPassword,
    role: "SUB_USER",
    permissions,
  });
  res
    .status(201)
    .json({ success: true, message: "Sub-user created", data: subUser });
};
exports.getSubUsers = async (req, res) => {
  const subUser = await User.find({
    parentUser: req.user.id,
    role: "SUB_USER",
  }).select("-password");
  res.status(200).json({ success: true, data: subUser });
};

exports.getSubUserById = async (req, res) => {
  const subUser = await User.findOne({
    _id: req.params.id,
    parentUser: req.user.id,
    role: "SUB_USER",
  }).select("-password");
  if (!subUser) {
    return res.status(404).json({ message: "Sub-user not found" });
  }
  res.status(200).json({ success: true, data: subUser });
};

exports.updateSubUser = async (req, res) => {
  const { name, permissions, status } = req.body;
  const updateData = await User.findOneAndUpdate(
    { _id: req.params.id, parentUser: req.user.id, role: "SUB_USER" },
    { name, permissions, status, updatedAt: Date.now() },
    { new: true }
  );
  if (!updateData) {
    return res.status(404).json({ message: "Sub-user not found" });
  }
  res
    .status(200)
    .json({ success: true, message: "Sub-user updated", data: updateData });
};
