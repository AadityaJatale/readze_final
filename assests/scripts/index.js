const express = require("express");
const session = require('express-session');
const app = express();
const path = require("path");
const multer = require("multer");
const router = express.Router();
const crypto = require('crypto');
const MongoStore = require('connect-mongo');
const { Register, Feedback, Admin, Book,UserCartBook } = require("./mongodb.js");

const templatePath = path.join(__dirname, '../../content');

app.set("view engine", "hbs");
app.set("views", templatePath);

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('hex');

// Serve static files from the public folder
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/LoginRegister" }) // Use create() method to initialize MongoStore
}));

app.use(express.static(path.join(__dirname, '../../assests/public')));
app.use(express.static(path.join(__dirname, '../../assests/scripts')));
app.use(express.static(path.join(__dirname, '../../assests/images')));

const storage = multer.memoryStorage(); // Use memory storage to handle file as Buffer
const upload = multer({ storage: storage });

app.post("/addBook", upload.single("image"), (req, res) => {
    const { bookName, author, price, description, category } = req.body;
    const image = req.file.buffer; // Get image buffer from request

    const newBook = new Book({ bookName, author, price, description, image, category });
    newBook.save()
        .then(() => {
            res.send("Book added successfully");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error saving to database");
        });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get("/home", async (req, res) => {
    try {
        if (req.session.user) {
            const user = req.session.user;
            const username = req.query.username;
            // Get distinct categories from the database
            const categories = await Book.distinct('category');
            // Create an object to store books for each category
            const booksByCategory = {};

            // Fetch books for each category
            for (const category of categories) {
                const books = await Book.find({ category });
                booksByCategory[category] = books.slice(0, 20);
            }
            for (const category in booksByCategory) {
                booksByCategory[category].forEach(book => {
                    // Assuming book.image is a Buffer containing the image data
                    book.imageBase64 = book.image.toString('base64');
                });
            }

            // Render homepage with categories and books
            res.render('home', { categories, booksByCategory, user });
        }
        else {
            res.redirect('/login');
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.use('/', router);

app.get('/', (req, res) => {
    res.render("login");
});

app.get('/adminManagebooks', async (req, res) => {
    try {
        const categories = await Book.distinct('category');
        const books = await Book.find({});
        res.render('adminManagebooks', { categories: categories, books: books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/books/count', async (req, res) => {
    try {
        const count = await Book.countDocuments();
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/books/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.sendStatus(200); // Send a success status back to the client
    } catch (err) {
        console.error(err);
        res.sendStatus(500); // Send an error status back to the client
    }
});

app.get('/header', (req, res) => {
    const user = req.session.user;
    res.render('header', { user: user });
});

app.get('/category', async (req, res) => {
    const user = req.session.user;
    const { bookId } = req.query;
    try {
        const book = await Book.findById(bookId);
        const imageData = book.image.toString('base64');

        res.render('category', { book, imageData,user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
router.get("/student-corner", async (req, res) => {
    const student_categories = ['student-guides', 'textbooks', 'refrence-books', 'exam-prep-books', 'college-books', 'technical-books', 'academic papers']; // Modify this to your actual array of categories
    try {
        if (req.session.user) {
            const user = req.session.user;
            const username = req.query.username;
            // Get distinct categories from the database
            const categories = await Book.distinct('category');
            // Create an object to store books for each category
            const booksByCategory = {};

            // Fetch books for each category
            for (const category of categories) {
                if(student_categories.includes(category)){
                    const books = await Book.find({ category });
                    booksByCategory[category] = books.slice(0, 20);
                }
                
            }
            for (const category in booksByCategory) {
                booksByCategory[category].forEach(book => {
                    // Assuming book.image is a Buffer containing the image data
                    book.imageBase64 = book.image.toString('base64');
                });
            }

            // Render homepage with categories and books
            res.render('student_corner', { categories, booksByCategory, user });
        }
        else {
            res.redirect('/login');
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/cart", async (req, res) => {
    const { bookId } = req.query; 
    const user = req.session.user;
    const userid=user._id;
    const data = {
        userID: userid,
        bookID: bookId,
    };
    await UserCartBook.insertMany([data]);
    try {
        // console.log()
        // // Get an array of bookIds
        // const bookIds = userBooks.map(userBooks => mongoose.Types.ObjectId(userBooks.bookId));
        // console.log(bookIds)
        // // Fetch all books with the bookIds
        // const books = await Book.find({ _id: { $in: bookIds } });

        // res.render("cart", { books });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
   
    res.render("cart");
});

app.get("/adminPage", (req, res) => {
    res.render("adminPage");
});


app.get("/addBooks",(req,res)=>{
    res.render("addBooks")
})

app.get("/adminNavbar",(req,res)=>{
    res.render("adminNavbar")
})
app.get("/manageUser",(req,res)=>{
    res.render("manageUser")
})
app.get("/manageAdmin",(req,res)=>{
    res.render("manageAdmin")
})
// app.get("/manageBook",(req,res)=>{
//     res.render("manageBook")
// })
app.get('/manageBook', async (req, res) => {
    try {
        const categories = await Book.distinct('category');
        const books = await Book.find({});
        res.render('manageBook', { categories: categories, books: books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
app.get("/manageFeedback",(req,res)=>{
    res.render("manageFeedback")
})

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get('/contact', (req, res) => {
    res.render("contact");
});

app.get('/footer', (req, res) => {
    res.render("footer");
});

app.get("/about", (req, res) => {
    res.render("about");
});

// app.get("/student-corner", (req, res) =>{
//     res.render("student_corner")
// })


app.get('/admin_script', async (req, res) => {
    try {
        const users = await Register.find();
        const admin = await Admin.find();
        const feedback = await Feedback.find();
        res.json({ users, admin, feedback });
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch user data');
    }
});


app.post("/register", async (req, res) => {
    const check = await Register.findOne({ username: req.body.username })
    if (!check) {
        const data = {
            username: req.body.username,
            email: req.body.email,
            phone_no: req.body.phone_no,
            password: req.body.password,
            admin: false
        };

        await Register.insertMany([data]);

        res.redirect("home");
    }
    else {
        res.send("username already exists")
    }

});

app.post("/contact", async (req, res) => {
    const feedback = {
        username: req.body.username,
        email: req.body.email,
        phone_no: req.body.phone_no,
        message: req.body.message
    };

    await Feedback.insertMany([feedback]);

    res.send("Thanks for feedback");
});

app.post("/login", async (req, res) => {
    try {
        const user = await Register.findOne({ username: req.body.username });
        const admin = await Admin.findOne({ username: req.body.username });
        if (!user) {
            if (admin) {
                res.redirect("manageUser");
                return;
            }
            else {
                res.send("user not found");
            }
        }

        else {
            if (user.password == req.body.password) {
                req.session.user = user;
                res.redirect('/home');
            } else {
                res.send("Wrong password");
            }
        }
    } catch {
        res.send("Error");
    }
});


app.listen(3001, () => {
    console.log("Server is running on port 3000");
});
