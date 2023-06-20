const Project = require('../models/project.model');
const Tag = require('../models/tag.model');

const getProjectById = async (req, res) => {
    const {id} = req.params;
    try {
        const project = await Project.findById(id);
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
        } else {
            sortCriteria = {};
        }

        const projectFields = 'title description';
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
        res.status(201).json(projects);
    } catch (error) {
        console.log('Error fetching projects:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const createProject = async (req, res) => {
    try {
        const {title, description, price, availableTonnes, tags} = req.body;
        // get an array of tag ids 
        const project = await Project.create({title, description, price, availableTonnes});
        
        // find existing tags by their IDs
        const existingTags = await Tag.find({_id: {$in: tags}});

        // add the existing tags to project
        project.tags.push(...existingTags);

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {createProject, getProjects, getProjectById};