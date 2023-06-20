const Tag = require('../models/tag.model');
const multer = require('multer');
const {v4: uuidv4} = require('uuid');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

const getTagById = async (req, res) => {
    const {id} = req.params;
    try {
        const tag = await Tag.findById(id);
        if(!tag){
            return res.status(404).json({message: 'Tag with Id not found!'});
        }
        return res.status(200).json(tag);
    } catch (error) {
        console.log(error);
    }
}

const getTags = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'latest';

        let sortCriteria;
        if(sortBy === 'latest'){
            sortCriteria = {_id: -1};
        } else if(sortBy === 'oldest'){
            sortCriteria = {_id: 1};
        } else {
            sortCriteria = {};
        }
        const skip = (page - 1) * limit;
        const tags = await Tag.find().sort(sortCriteria).skip(skip).limit(parseInt(limit));
        res.status(201).json(tags);
    } catch (error) {
        res.status(500).json(error);
    }
}

const createTag = async(req, res) => {
    try {
        const upload = await cloudinary.v2.uploader.upload(req.file.path);
        if(upload.secure_url){
            const {name, description} = req.body;
            const tag = await Tag.create({name: name, icon: upload.secure_url, description: description});
            res.status(201).json(tag);
        } else {
            return res.status(500).json({
                message: "Error Uploading Image"
            })
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
        res.status(500).json(error);
    }
};

module.exports = {createTag, getTags, getTagById}