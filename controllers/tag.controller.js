const Tag = require("../models/tag.model");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

const getTagById = async (req, res) => {
  const { id } = req.params;
  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag with Id not found!" });
    }
    return res.status(200).json(tag);
  } catch (error) {
    console.log(error);
  }
};

const getTags = async (req, res) => {
  try {
    const getAll = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = getAll ? null : parseInt(req.query.limit) || 5;
    const sortBy = req.query.sortBy || "latest";

    let sortCriteria;
    if (sortBy === "latest") {
      sortCriteria = { _id: -1 };
    } else if (sortBy === "oldest") {
      sortCriteria = { _id: 1 };
    } else {
      sortCriteria = {};
    }
    // const skip = (page - 1) * limit;
    let query = Tag.find();
    if (!getAll) {
      // Only apply pagination if not fetching all
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }
    // const tags = await Tag.find()
    //   .sort(sortCriteria)
    //   .skip(skip)
    //   .limit(parseInt(limit));
    const tags = await query.sort(sortCriteria);
    const total = await Tag.countDocuments();
    res.status(201).json({
      tags,
      total,
      page,
      totalPages: getAll ? 1 : Math.ceil(total / limit),
      getAll,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const createTag = async (req, res) => {
  try {
    const upload = await cloudinary.v2.uploader.upload(req.file.path);
    if (upload.secure_url) {
      const { name, description } = req.body;
      const tag = await Tag.create({
        name: name,
        icon: upload.secure_url,
        description: description,
      });
      res.status(201).json(tag);
    } else {
      return res.status(500).json({
        message: "Error Uploading Image",
      });
    }
    // return res.json({
    //     success: true,
    //     file: upload.secure_url
    // });
    // const uploader = async (path) => await cloudinary.uploads(path, 'images');
    // const {path} = file;
    // const newPath = await uploader(path);
    // const urls = [];
    // const files = req.files;
    // for(const file of files){
    //     const {path} = file;
    //     const newPath = await uploader(path);
    //     urls.push(newPath);
    //     fs.unlinkSync(path);
    // }

    // console.log(urls);
    // const tag = await Tag.create(req.body);
    // res.status(201).json(tag);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const seedTags = async (req, res) => {
  try {
    // await Tag.deleteMany({});

    const tags = [
      {
        name: "No Poverty",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description: "End poverty in all its forms everywhere.",
      },
      {
        name: "Zero Hunger",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.",
      },
      {
        name: "Good Health and Well-being",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Ensure healthy lives and promote well-being for all at all ages.",
      },
      {
        name: "Quality Education",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
      },
      {
        name: "Gender Equality",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description: "Achieve gender equality and empower all women and girls.",
      },
      {
        name: "Clean Water and Sanitation",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Ensure availability and sustainable management of water and sanitation for all.",
      },
      {
        name: "Affordable and Clean Energy",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Ensure access to affordable, reliable, sustainable, and modern energy for all.",
      },
      {
        name: "Decent Work and Economic Growth",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.",
      },
      {
        name: "Industry, Innovation, and Infrastructure",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Build resilient infrastructure, promote inclusive and sustainable industrialization, and foster innovation.",
      },
      {
        name: "Reduced Inequality",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description: "Reduce inequality within and among countries.",
      },
      {
        name: "Sustainable Cities and Communities",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Make cities and human settlements inclusive, safe, resilient, and sustainable.",
      },
      {
        name: "Responsible Consumption and Production",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description: "Ensure sustainable consumption and production patterns.",
      },
      {
        name: "Climate Action",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Take urgent action to combat climate change and its impacts.",
      },
      {
        name: "Life Below Water",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Conserve and sustainably use the oceans, seas, and marine resources for sustainable development.",
      },
      {
        name: "Life on Land",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Protect, restore, and promote sustainable use of terrestrial ecosystems, manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss.",
      },
      {
        name: "Peace, Justice, and Strong Institutions",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable, and inclusive institutions at all levels.",
      },
      {
        name: "Partnerships for the Goals",
        icon: "https://res.cloudinary.com/isaacoduh/image/upload/v1687159917/efttuswjn1isqgccpf1g.png",
        description:
          "Strengthen the means of implementation and revitalize the global partnership for sustainable development.",
      },
    ];

    await Tag.insertMany(tags);
    res.status(201).json({ message: "Tags seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: `Error Seeding Tags: ${error.message}` });
  }
};

module.exports = { createTag, getTags, getTagById, seedTags };
