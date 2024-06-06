const mongoose = require('mongoose');
const app = require('./app');
const PORT = process.env.PORT || 5100;

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(() => {
    // mongoose.connection.dropDatabase();
    app.listen(PORT, console.log(`Server started on PORT ${PORT}`));
}).catch((err) => {
    console.log(err);
});