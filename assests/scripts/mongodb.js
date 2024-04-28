const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/LoginRegister", {
}).then(() => {
    console.log("MongoDB connected with LoginRegister");
}).catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
});


const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_no: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
const UserCartBooks = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    bookID: {
        type: String,
        required: true
    }
});

const RegisterSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_no: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});



const FeedbackSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_no: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

const bookSchema = new mongoose.Schema({
    bookName: String,
    author: String,
    price: Number,
    description: String,
    image: Buffer,
    category: String
});


module.exports = {
    Register: mongoose.model("Register_Data", RegisterSchema),
    Feedback: mongoose.model("feedback_Data", FeedbackSchema),
    Admin: mongoose.model("Admin_Data", AdminSchema),
    Book: mongoose.model("Books_Data", bookSchema),
    UserCartBook: mongoose.model("UserCart_Data", UserCartBooks)
};
