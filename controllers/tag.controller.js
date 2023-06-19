const Tag = require('../models/tag.model');
const multer = require('multer');
const {v4: uuidv4} = require('uuid');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

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

module.exports = {createTag}