const mrv_userModel = require("../models/mrv_user.model");
const User = require("../models/user.model");
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMRVUser = async (req, res) => {
  try {
    const user = await mrv_userModel.findOne({ email: req.params.email });
    await user.deleteOne();
    res.status(204).send({ message: "User MRV User Deleted" });
  } catch (error) {}
};

module.exports = { getAllUsers, deleteMRVUser };
