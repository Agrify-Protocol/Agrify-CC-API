const Project = require("../models/project.model.js");
const BulkOrder = require("../models/bulk_order.model.js");
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
    const farmFields = "name state country farmer availableTonnes farmImages"
    const project = await Aggregate.findById(id).populate({
      path: "farms",
      select: farmFields,
    }).populate({ path: "projectToken" })
    .sort({ availableTonnes: -1 });
    const tokenBalance = tokenService.queryTokenBalance(project.projectToken.tokenId);
    project.projectToken.availableTonnes = tokenBalance;

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
const deleteUnsafe = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Aggregate.findById(id);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID: ${id} not found!` });
    }
    await project.deleteOne();
    return res.status(200).json({message: "Deleted"});
  } catch (error) {
    console.log(error);
  }
};



const getProjectsByCategory = async (req, res) => {
  const { category } = req.params;

  //TODO: Sync availableTonnes from Hedera
  try {
    const filter = { category: { $in: [category] } };
    const projects = await Aggregate.find(filter).populate({ path: "projectToken" });
    const resultList = [];

    const result = await projects.reduce((acc, product) => {
      // If the category is already present, update the total price and count
      const location = `${product.state}, ${product.country}`;
      if (acc[location]) {
        acc[location].totalTonnes += product.projectToken.availableTonnes;
        acc[location].farms += product.farms.length;
      } else {
        // If the category is new, initialize it
        acc[location] = { projectID: product._id };
        acc[location].state = product.state;
        acc[location].country = product.country;
        acc[location].totalTonnes = product.projectToken.availableTonnes;
        acc[location].farms = product.farms.length;
        resultList.push(acc[location]);
      }
      return acc;
    }, {});

    function sumTonnes() {
      let sum = 0;
      Object.keys(result).map(category => {
        const { totalTonnes } = result[category];
        sum += totalTonnes;
      });
      return sum;
    }

    const totalTonnes = sumTonnes();

    res.status(200).json({ message: `List of ${category} farms`, "Total Available Credits": totalTonnes, data: resultList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getAllProjectCategories = async (req, res) => {

  //TODO: Sync availableTonnes from Hedera
  try {
    const projects = await Aggregate.find().populate({ path: "projectToken" });

    const resultList = [];

    const result = await projects.reduce((acc, product) => {
      // If the category is already present, update the total price and count
      const location = product.category;
      if (acc[location]) {
        acc[location].totalTonnes += product.projectToken.availableTonnes;
        acc[location].farms += product.farms.length;
      } else {
        // If the category is new, initialize it
        acc[location] = { totalTonnes: product.projectToken.availableTonnes };
        acc[location].farms = product.farms.length;
        acc[location].category = product.category;

        resultList.push(acc[location]);
      }
      return acc;
    }, {});

    function sumTonnes() {
      let sum = 0;
      Object.keys(result).map(category => {
        const { totalTonnes } = result[category];
        sum += totalTonnes;
      });
      return sum;
    }

    const totalTonnes = sumTonnes();

    res.status(200).json({ message: `All farms`, "Total Agrify Credits": totalTonnes, data: resultList });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    const projectFields = "title description availableTonnes category";
    // const tagFields = "icon";
    const skip = (page - 1) * limit;
    const projects = await Aggregate.find({}, projectFields)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "farms",
        select: "name state country category availableTonnes ",
      });
    const total = await Aggregate.countDocuments();
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
    let image = {};
    let coverImage;
    let supportingDocumentLink;
    if (req.files.images) {
      for (const file of req.files.images) {
        const uploadResult = await cloudinary.v2.uploader.upload(file.path);
        image.image = uploadResult.secure_url;
        uploadedImages.push(image);
      }
    }
    if (req.files.cover) {
      const coverImageUpload = await cloudinary.v2.uploader.upload(
        req.files.cover[0].path
      );
      coverImage = coverImageUpload.secure_url;
    }
    if (req.files.supdoc) {
      const supportingDocumentLinkUpload = await cloudinary.v2.uploader.upload(
        req.files.supdoc[0].path
      );
      supportingDocumentLink = supportingDocumentLinkUpload.secure_url;
    }

    const {
      title,
      description,
      mission,
      methodology,
      price,
      latitude,
      longitude,
      tags,
      minimumPurchaseTonnes,
      state,
      country,
      category,
      creditStartDate,
      creditEndDate,
      contractType,

      tokenId,
      tokenSymbol,
    } = req.body;

    //Create token for project
    const token = await tokenService.createToken(
      aggregateId,
      title,
      req.userId,
      minimumPurchaseTonnes,
      price,
      tokenId,
      tokenSymbol,
    );
    if (!token) throw new Error("Error creating project token");

    const aggregate = await Aggregate.create({
      projectId: aggregateId,
      title,
      description,
      mission,
      methodology,
      price: parseFloat(price),
      images: uploadedImages,
      location: `${state}, ${country}`,
      state,
      country: country == "NG" ? "Nigeria" : country,
      latitude,
      longitude,
      category: category.toLowerCase(),
      creditStartDate: convertStringToDate(creditStartDate),
      creditEndDate: convertStringToDate(creditEndDate),
      contractType,
      coverImage: coverImage,
      supportingDocument: supportingDocumentLink,
      projectToken: token,
    });

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
const preorderFarmProduce = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      amount,
      name,
      phoneNumber,
      address
     } = req.body;

    const order = await BulkOrder.create({
      amount,
      name,
      phoneNumber,
      address,
      projectID: id
    });

    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};


const getAllPreOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const sortBy = req.query.sortBy || "latest";

    let sortCriteria;
    if (sortBy === "latest") {
      sortCriteria = { _id: -1 };
    } else if (sortBy === "oldest") {
      sortCriteria = { _id: 1 };
    } else {
      sortCriteria = {};
    }

    const skip = (page - 1) * limit;
    const orders = await BulkOrder.find({})
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await BulkOrder.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page < 1 ? page - 1 : null;

    res
      .status(200)
      .json({ orders, total, page, totalPages, nextPage, prevPage });
  } catch (error) {
    console.log("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await BulkOrder.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ message: `Order with ID: ${id} not found!` });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
  }
};


const addFarmToAggregate = async (req, res) => {
  const { farmID, projectID } = req.body;

  try {
    const farm = await Farm.findById(farmID);
    if (!farm) {
      throw new Error(`Farm ${farmID} not found`);
    }
    if (!farm.availableTonnes) {
      throw new Error(`Unable to get carbon available on farm`);
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

    if (farm.category != aggregate.category) {
      throw new Error(`Farm ${farmID} is not a ${aggregate.category} farm`);
    }

    if (farm.state != aggregate.state || farm.country != aggregate.country) {
      throw new Error(`Farm ${farmID} is not in ${aggregate.state}, ${aggregate.country}`);
    }

    //Add farm to aggregate
    await aggregate.farms.push(farmID);
    await aggregate.save();

    //TODO: Remove. Minting will be done by Guardian API
    //Mint tokens
    // const amountOfTokens = farm.availableTonnes;
    // const projectToken = await Token.findById(aggregate.projectToken.toString());
    // if (!projectToken) {
    //   throw new Error(`No token found for project ${projectID}`);
    // }
    // const token = await tokenService.mintToken(projectToken.tokenSymbol, amountOfTokens);
    // if (!token) throw new Error("Error minting project token");

    //Add farmer to tokenList
    // await aggregate.projectFarmers.push(farm.farmer);
    // await aggregate.save();

    res.status(200).json(aggregate);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createAggregateProject, //TODO: Admin middleware
  getAllAggregateProjects,
  getAllProjectCategories,
  getProjectsByCategory,
  addFarmToAggregate,
  getAggregateProjectById,
  preorderFarmProduce,
  getAllPreOrders,
  getOrderById,
  deleteUnsafe,
};
