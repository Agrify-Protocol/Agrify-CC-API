const express = require('express');
const projectRoutes = require('./routes/project.route');
const tagRoutes = require('./routes/tag.route');

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({alive: "True"});
});

app.use("/api/v1", projectRoutes);
app.use("/api/v1", tagRoutes);
module.exports = app;