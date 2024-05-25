const Project = require('../models/project.model');
const Tag = require('../models/tag.model');
const cloudinary = require('../utils/cloudinary');
const moment = require('moment');
const tokenService = require("../service/tokenService.js");
const authMiddleWare = require("../middleware/auth")

const getProjectById = async (req, res) => {
    const {id} = req.params;
    try {
        const project = await Project.findById(id).populate({path: 'tags'});
        if(!project){
            return res.status(404).json({message: `Project with ID: ${id} not found!`});
        }
        return res.status(200).json(project);
    } catch (error) {
        console.log(error);
    }
}
const getProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'latest';

        let sortCriteria;
        if(sortBy === 'latest'){
            sortCriteria = {_id: -1};
        } else if(sortBy === 'oldest'){
            sortCriteria = {_id: 1};
        }else if (sortBy === 'priceLowToHigh') {
            sortCriteria = { price: 1 }; 
        } else if (sortBy === 'priceHighToLow') {
            sortCriteria = { price: -1 }; 
        }else if (sortBy === 'tonnesLeftLowToHigh') {
            sortCriteria = { availableTonnes: 1 }; 
        }else if (sortBy === 'tonnesLeftHighToLow') {
            sortCriteria = { availableTonnes: -1 }; 
        }else {
            sortCriteria = {};
        }

        const projectFields = 'title description price availableTonnes';
        const tagFields = 'icon';
        const skip = (page - 1) * limit;
        const projects = await Project.find({},projectFields)
            .sort(sortCriteria)
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path:'tags',
                select: tagFields
            });
        res.status(200).json(projects);
    } catch (error) {
        console.log('Error fetching projects:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}
function generateProjectID() {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    code += digits[randomIndex];
  }
  return code;
}

function convertStringToDate(x){
    return moment(x).toDate();
}
const createProject = async (req, res) => {
    try {
        const projectId = generateProjectID();
        // console.log(req.files);
        let uploadedImages = [];
        let coverImage;
        let supportingDocumentLink;
        if(req.files){
            for(const file of req.files.images){
                const uploadResult = await cloudinary.v2.uploader.upload(file.path);
                uploadedImages.push(uploadResult.secure_url);
            }
            const coverImageUpload = await cloudinary.v2.uploader.upload(req.files.cover[0].path);
            coverImage = coverImageUpload.secure_url;
            const supportingDocumentLinkUpload = await cloudinary.v2.uploader.upload(req.files.supdoc[0].path);
            supportingDocumentLink = supportingDocumentLinkUpload.secure_url;
        }
         
        const {
            title, description, price, availableTonnes, tags,minimumPurchaseTonnes, location, countryOfOrigin,creditStartDate,creditEndDate,projectProvider, projectWebsite,blockchainAddress, typeOfProject, certification, certificationURL, certificateCode
            } = req.body;            
            

        const project = await Project.create({
            title,description,price: parseFloat(price),availableTonnes: parseInt(availableTonnes),images: uploadedImages,projectId, minimumPurchaseTonnes: parseInt(minimumPurchaseTonnes),location, countryOfOrigin, creditStartDate: convertStringToDate(creditStartDate),creditEndDate: convertStringToDate(creditEndDate),coverImage: coverImage, projectProvider, projectWebsite,blockchainAddress, typeOfProject, certification, certificationURL, certificateCode, supportingDocument: supportingDocumentLink
        });

        //Create token for project
        const token = await tokenService.createToken(project.projectId, title, req.userId, availableTonnes * 100 );
        if (!token) throw new Error("Error creating project token");
        project.projectToken = token;
        
        // find existing tags by their IDs
        const existingTags = await Tag.find({_id: {$in: tags}});

        // // add the existing tags to project
        project.tags.push(...existingTags);

        // await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = {createProject, getProjects, getProjectById};