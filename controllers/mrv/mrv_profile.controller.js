const express = require("express");
const authMiddleware = require("../../middleware/auth");
const MrvUser = require("../../models/mrv_user.model");
const cloudinary = require("../../utils/cloudinary");

const getProfile = async (req, res) => {
  try {
    const mrvUser = await MrvUser.findById(req.userId).populate("wallet", { currency: 1, balance: 1 });

    const profileData = {
      _id: mrvUser._id,
      firstname: mrvUser.firstname,
      lastname: mrvUser.lastname,
      email: mrvUser.email,
      profileImageUrl: mrvUser.profileImageUrl,
      isOnboardingComplete: mrvUser.isOnboardingComplete,
      wallet: mrvUser.wallet,
    };
    res.status(200).json({ mrvUser: profileData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, phoneNumber, profileImage } = req.body;

    const mrvUser = await MrvUser.findById(req.userId);
    if (!mrvUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update firstname and lastname
    if (firstname) {
      mrvUser.firstname = firstname;
    }
    if (lastname) { mrvUser.lastname = lastname; }
    if (phoneNumber) {
      mrvUser.phoneNumber = phoneNumber;
    }
    if (profileImage) {
      const uploadImage = await cloudinary.v2.uploader.upload(profileImage, {});
      mrvUser.profileImageUrl = uploadImage.secure_url;
    }

    await mrvUser.save();
    // const updateUser = await MrvUser.findByIdAndUpdate(req.userId, {
    //   firstname,
    //   lastname,
    // });
    // await updateUser.save();
    // const result = {
    //   _id: updateUser._id,
    //   firstname: updateUser.firstname,
    //   lastname: updateUser.lastname,
    //   email: updateUser.email,
    //   profileImageUrl: updateUser.profileImageUrl,
    //   isOnboardingComplete: updateUser.isOnboardingComplete,
    // };

    res.status(200).json({ message: "Profile updated successfully" });
    // res.status(200).json({ mrvUser: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
