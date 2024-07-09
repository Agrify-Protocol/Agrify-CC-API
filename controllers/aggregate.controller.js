const Project = require("../models/project.model.js");
const Aggregate = require("../models/aggregate.model.js");
const Token = require("../models/token.model.js");
const Farm = require("../models/farm.model.js");
const Tag = require("../models/tag.model.js");
const cloudinary = require("../utils/cloudinary.js");
const moment = require("moment");
const tokenService = require("../service/tokenService.js");
const authMiddleWare = require("../middleware/auth.js");
const { faker } = require("@faker-js/faker");

const getAggregateProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const farmFields = "name state country farmer availableTonnes"
    const project = await Aggregate.findById(id).populate({
      path: "farms",
      select: farmFields,
    }).populate({ path: "projectToken" })
    .sort( { availableTonnes: -1 });
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID: ${id} not found!` });
    }
    return res.status(200).json(project);
  } catch (error) {
    console.log(error);
  }
};

const getAllAggregateProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const sortBy = req.query.sortBy || "tonnesLeftHighToLow";

    let sortCriteria;
    if (sortBy === "latest") {
      sortCriteria = { _id: -1 };
    } else if (sortBy === "oldest") {
      sortCriteria = { _id: 1 };
    } else if (sortBy === "priceLowToHigh") {
      sortCriteria = { price: 1 };
    } else if (sortBy === "priceHighToLow") {
      sortCriteria = { price: -1 };
    } else if (sortBy === "tonnesLeftLowToHigh") {
      sortCriteria = { availableTonnes: 1 };
    } else if (sortBy === "tonnesLeftHighToLow") {
      sortCriteria = { availableTonnes: -1 };
    } else {
      sortCriteria = {};
    }

    const projectFields = "title description availableTonnes";
    const tagFields = "icon";
    const skip = (page - 1) * limit;
    const projects = await Aggregate.find({}, projectFields)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "tags",
        select: tagFields,
      });
    const total = await Project.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page < 1 ? page - 1 : null;
    //const response = await fetch(`/api/projects?page=${page}&limit=${limit}&sortBy=${sortBy}`);

    res
      .status(200)
      .json({ projects, total, page, totalPages, nextPage, prevPage });
  } catch (error) {
    console.log("Error fetching projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
function generateProjectID() {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    code += digits[randomIndex];
  }
  return code;
}

function convertStringToDate(x) {
  return moment(x).toDate();
}
const createAggregateProject = async (req, res) => {
  try {
    const aggregateId = generateProjectID();
    // console.log(req.files);
    let uploadedImages = [];
    let coverImage;
    let supportingDocumentLink;
    // if (req.files) {
    //   for (const file of req.files.images) {
    //     const uploadResult = await cloudinary.v2.uploader.upload(file.path);
    //     uploadedImages.push(uploadResult.secure_url);
    //   }
    //   const coverImageUpload = await cloudinary.v2.uploader.upload(
    //     req.files.cover[0].path
    //   );
    //   coverImage = coverImageUpload.secure_url;
    //   const supportingDocumentLinkUpload = await cloudinary.v2.uploader.upload(
    //     req.files.supdoc[0].path
    //   );
    //   supportingDocumentLink = supportingDocumentLinkUpload.secure_url;
    // }

    const {
      title,
      description,
      price,
      // availableTonnes,
      // totalTonnes,
      tags,
      minimumPurchaseTonnes,
      state,
      country,
      category,
      creditStartDate,
      creditEndDate,
      // projectProvider,
      // projectWebsite,
      // blockchainAddress,
      // typeOfProject,
      // certification,
      // certificationURL,
      // certificateCode,
    } = req.body;

    //Create token for project
    const token = await tokenService.createToken(
      aggregateId,
      title,
      req.userId,
      // totalTonnes,
      // availableTonnes,
      minimumPurchaseTonnes,
      price
    );
    if (!token) throw new Error("Error creating project token");

    const aggregate = await Aggregate.create({
      projectId: aggregateId,
      title,
      description,
      price: parseFloat(price),
      // availableTonnes: 0,
      // totalTonnes: 0,
      images: uploadedImages,
      // aggregateId,
      // minimumPurchaseTonnes: parseInt(minimumPurchaseTonnes),
      location: `${state}, ${country}`,
      state,
      country,
      category: category.toLowerCase(),
      creditStartDate: convertStringToDate(creditStartDate),
      creditEndDate: convertStringToDate(creditEndDate),
      coverImage: coverImage,
      // projectProvider,
      // projectWebsite,
      // blockchainAddress,
      // typeOfProject,
      // certification,
      // certificationURL,
      // certificateCode,
      supportingDocument: supportingDocumentLink,
      projectToken: token,
    });

    // project.projectToken = token;

    // find existing tags by their IDs
    const existingTags = await Tag.find({ _id: { $in: tags } });

    // // add the existing tags to project
    aggregate.tags.push(...existingTags);

    // await project.save();
    res.status(201).json(aggregate);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const addFarmToAggregate = async (req, res) => {
  const { farmID, projectID } = req.body;

  try {
    const farm = await Farm.findById(farmID);
    if (!farm) {
      throw new Error(`Farm ${farmID} not found`);
    }
    const aggregate = await Aggregate.findById(projectID);
    if (!aggregate) {
      throw new Error(`Project ${projectID} not found`);
    }

    const farmList = aggregate.farms;

    //Check if farm already belongs to aggregate
    const farmAlreadyExists = farmList.findIndex(t => t.toHexString() == farmID)
    if (farmAlreadyExists != -1) {
      throw new Error(`Farm ${farmID} is already a part of this project`);

    }
    // else {
    //   //Add farm
    // }

    if (farm.category != aggregate.category) {
      throw new Error(`Farm ${farmID} is not a ${aggregate.category} farm`);
    }

    if (farm.state != aggregate.state && farm.country != aggregate.country) {
      throw new Error(`Farm ${farmID} is not in ${aggregate.state}, ${aggregate.country}`);
    }

    //Add farm to aggregate
    await aggregate.farms.push(farmID);
    await aggregate.save();

    //Mint tokens
    const amountOfTokens = farm.availableTonnes;
    const projectToken = await Token.findById(aggregate.projectToken.toString());
    if (!projectToken) {
      throw new Error(`No token found for project ${projectID}`);
    }
    const token = await tokenService.mintToken(projectToken.tokenSymbol, amountOfTokens);
    if (!token) throw new Error("Error minting project token");

    //Add farmer to tokenList
    await token.projectFarmers.push(farm.farmer);
    await token.save();

    res.status(200).json(aggregate);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createAggregateProject, //TODO: Admin middleware
  getAllAggregateProjects,
  addFarmToAggregate,
  getAggregateProjectById,
  // seedProjects,
  // resetSeedProjects,
};
