const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

require('dotenv').config();

beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
    await mongoose.connection.close();
});


describe("POST /api/projects", () => {
    it("should create a project", async () => {
        const res = await request(app).post("/api/v1/projects").send({
            title: "Taiwan Waste Crop Farming",
            price: 4.99,
            description: "Basic description for a nounced key value pair",
            availableTonnes: 31000
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Taiwan Waste Crop Farming");
    });
});