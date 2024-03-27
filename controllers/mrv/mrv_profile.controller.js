const express = require("express");
const authMiddleware = require("../../middleware/auth");
const MrvUser = require("../../models/mrv_user.model");

const getProfile = async (req, res) => {
  try {
    const mrvUser = await MrvUser.findById(req.userId);

    const profileData = {
      _id: mrvUser._id,
      firstname: mrvUser.firstname,
      lastname: mrvUser.lastname,
      profileImageUrl: mrvUser.profileImageUrl,
      isOnboardingComplete: mrvUser.isOnboardingComplete,
    };
    res.status(200).json({ mrvUser: profileData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProfile };
