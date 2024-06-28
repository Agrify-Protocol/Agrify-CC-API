const Project = require("../models/project.model");
const Tag = require("../models/tag.model");
const cloudinary = require("../utils/cloudinary");
const moment = require("moment");
const tokenService = require("../service/tokenService.js");
const authMiddleWare = require("../middleware/auth");
const { faker } = require("@faker-js/faker");

const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id).populate({ path: "tags" }).populate({ path: "projectToken" });
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
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sortBy = req.query.sortBy || "latest";

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

    const projectFields = "title coverImage";
    const tagFields = "icon";
    const skip = (page - 1) * limit;
    const projects = await Project.find({}, projectFields)
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
const createProject = async (req, res) => {
  try {
    const projectId = generateProjectID();
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
      availableTonnes,
      totalTonnes,
      tags,
      minimumPurchaseTonnes,
      location,
      countryOfOrigin,
      creditStartDate,
      creditEndDate,
      projectProvider,
      projectWebsite,
      blockchainAddress,
      typeOfProject,
      certification,
      certificationURL,
      certificateCode,
    } = req.body;

    //Create token for project
    const token = await tokenService.createToken(
      projectId,
      title,
      req.userId,
      totalTonnes,
      availableTonnes,
      minimumPurchaseTonnes,
      price
    );
    if (!token) throw new Error("Error creating project token");

    const project = await Project.create({
      title,
      description,
      // price: parseFloat(price),
      // availableTonnes: parseInt(availableTonnes),
      // totalTonnes: parseInt(totalTonnes),
      images: uploadedImages,
      projectId,
      // minimumPurchaseTonnes: parseInt(minimumPurchaseTonnes),
      location,
      countryOfOrigin,
      creditStartDate: convertStringToDate(creditStartDate),
      creditEndDate: convertStringToDate(creditEndDate),
      coverImage: coverImage,
      projectProvider,
      projectWebsite,
      blockchainAddress,
      typeOfProject,
      certification,
      certificationURL,
      certificateCode,
      supportingDocument: supportingDocumentLink,
      projectToken: token,
    });

    // project.projectToken = token;

    // find existing tags by their IDs
    const existingTags = await Tag.find({ _id: { $in: tags } });

    // // add the existing tags to project
    project.tags.push(...existingTags);

    // await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const seedProjects = async (req, res) => {
  const count = parseInt(req.query.count) || 1;
  const clear = req.query.clear === "true";
  const projects = await generateProjectData(count);
  try {
    // delete exisiting projects
    // await Project.deleteMany();

    await Project.insertMany(projects);
    return res.status(201).json({
      message: "Projects have been seeded!",
      count: projects.length,
    });
  } catch (error) {
    console.error("Error seeding projects:", error);
  }
};

const resetSeedProjects = async (req, res) => {
  const count = 10;
  const projects = await generateProjectData(count);
  try {
    await Project.deleteMany({});
    await Project.insertMany(projects);

    return res
      .status(201)
      .json({ messge: "Project Database has been reset!", count });
  } catch (error) {
    console.log("Error reseting projects list: ", error);
  }
};

const generateProjectData = async (numProjects) => {
  const projects = [];

  for (let i = 0; i < numProjects; i++) {
    const tags = await getRandomTags();
    projects.push({
      title: faker.commerce.productName(),
      description: faker.lorem.paragraphs(2),
      price: faker.number.int({ min: 100, max: 1000 }),
      availableTonnes: faker.number.int({ min: 1, max: 1000 }),
      totalTonnes: faker.number.int({ min: 100, max: 14000 }),
      tags: tags,
      images: [
        { image: faker.image.url(), description: faker.lorem.sentence() },
        { image: faker.image.url(), description: faker.lorem.sentence() },
      ],
      coverImage: faker.image.url(),
      projectId: `PRJ${faker.number.int({ min: 100, max: 9999 })}`,
      minimumPurchaseTonnes: faker.number.int({ min: 1, max: 20 }),
      location: faker.location.city(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      countryOfOrigin: faker.location.country(),
      projectProvider: faker.company.buzzPhrase(),
      projectWebsite: faker.internet.url(),
      blockchainAddress: faker.finance.ethereumAddress(),
      typeOfProject: "Environmental",
      certification: "ISO 140001",
      certificationURL: faker.internet.url(),
      certificateCode: `ISO140001-${faker.date.future().getFullYear()}`,
      creditStartDate: faker.date.future(),
      creditEndDate: faker.date.future(),
      supportingDocument: faker.system.commonFileName("pdf"),
      projectToken: null,
    });
  }

  return projects;
};

const getRandomTags = async () => {
  const count = Math.random() > 0.5 ? 4 : 5;
  const tags = await Tag.aggregate([{ $sample: { size: count } }]);
  return tags.map((tag) => tag._id);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  seedProjects,
  resetSeedProjects,
};
