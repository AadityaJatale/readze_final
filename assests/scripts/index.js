const express = require("express");
const session = require('express-session');
const app = express();
const path = require("path");
const multer = require("multer");
const router = express.Router();
const crypto = require('crypto');
const MongoStore = require('connect-mongo');
const { Register, Feedback, Admin, Book,UserItsCartBook , UserBook} = require("./mongodb.js");

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

//------------------Admin APIs---------------------
app.post("/addBook", upload.fields([{ name: "image", maxCount: 1 }, { name: "book", maxCount: 1 }]), (req, res) => {
    const { bookName, author, price, description, category } = req.body;
    const image = req.files['image'][0].buffer; // Get image buffer from request
    const book = req.files['book'][0].buffer;

    const newBook = new Book({ bookName, author, price, description, image, book, category });
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

app.get('/header', async (req, res) => {
    const user = req.session.user;
    const userID = req.session.user._id; // Assuming userID is stored in the session
    try {
        const userCartBooks = await UserItsCartBook.find({ userID }).lean();
        
        if (!userCartBooks) {
            return res.status(404).send('No cart items found');
        }

        // Fetch book details for each bookID in the user's cart
        const bookIDs = userCartBooks.map(item => item.bookID);
        const books = await Book.find({ _id: { $in: bookIDs } }).lean();
    
        const userCart = userCartBooks.map(item => {
            const book = books.find(book => book._id.toString() === item.bookID);
            // img = book.image.toString('base64');
            return { ...item, book};
        });
        const bookCount = userCart.length;
        res.render('header', { user: user, bookCount});

    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to load user cart');
    }
    
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


// Endpoint to fetch all books in the user's cart
app.get('/cart', async (req, res) => {
    const userID = req.session.user._id; // Assuming userID is stored in the session
    try {
        const userCartBooks = await UserItsCartBook.find({ userID }).lean();
        
        if (!userCartBooks || userCartBooks.length === 0) {
            return res.status(404).send('No cart items found');
        }

        // Fetch book details for each bookID in the user's cart
        const bookIDs = userCartBooks.map(item => item.bookID);
        console.log("BookIds:", bookIDs);
        
        // Find books only if there are bookIDs available
        if (bookIDs.length > 0) {
            const books = await Book.find({ _id: { $in: bookIDs } }).lean();
            console.log("Books:", books);
            if (!books || books.length === 0) {
                // If no books found, render the cart page with an empty book array
                return res.render('cart', { book: [], bookCount: 0 });
            }

            const userCart = userCartBooks.map(item => {
                const book = books.find(book => book._id.toString() === item.bookID);
                // Check if book is found and has an 'image' property before accessing it
                const img = (book && book.image) ? book.image.toString('base64') : null;
                return { ...item, book, img };
            });

            console.log("UserCart:", userCart);
            const bookCount = userCart.length;

            res.render('cart', { book: userCart, bookCount });
        } else {
            // If no bookIDs found, render the cart page with an empty book array
            res.render('cart', { book: [], bookCount: 0 });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to load user cart');
    }
});

app.get("/addCart", async (req, res) => {
    const { bookId } = req.query; 

    // Check if the user is logged in
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect the user to the login page if not logged in
    }

    // // Check if bookId is provided
    // if (!bookId) {
    //     return res.status(400).send('Book ID is missing.'); // Send an error response if bookId is missing
    // }

    // Access the user ID from the session
    const userid = req.session.user._id;

    // Create data object for UserCartBook
    const data = {
        userID: userid,
        bookID: bookId,
    };
   
    try {
        // Insert data into UserCartBook collection
        await UserItsCartBook.insertMany([data]);
        res.redirect("cart"); // Render the cart page
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/myBooks", async (req, res) => {
    const userID = req.session.user._id; // Assuming userID is stored in the session
    try {
        const userCartBooks = await UserBook.find({ userID }).lean();
        
        if (!userCartBooks || userCartBooks.length === 0) {
            return res.status(404).send('No cart items found');
        }

        // Fetch book details for each bookID in the user's cart
        const bookIDs = userCartBooks.map(item => item.bookID);
        const books = await Book.find({ _id: { $in: bookIDs } }).lean();
    
        const userCart = userCartBooks.map(item => {
            const book = books.find(book => book._id.toString() === item.bookID);
            // Check if book is found and if it has an image
            const img = book && book.image ? book.image.toString('base64') : null;
            return { ...item, book, img };
        });
        const bookCount = userCart.length;

        res.render('myBOoks', { book: userCart , bookCount});
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to load user cart');
    }
});


app.get("/buy", async (req, res) => {
    // Check if the user is logged in
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect the user to the login page if not logged in
    }

    const { bookId } = req.query; 
    const userID = req.session.user._id;

    try {
        // Check if the user has already purchased the book
        const check = await UserBook.find({ userID: userID, bookID: bookId });
        
        if (check.length > 0) {
            // Book already purchased
            return res.status(400).send("Book Is already Purchased");
        }

        // Create data object for UserBook
        const data = {
            userID: userID,
            bookID: bookId,
        };
       
        // Insert data into UserBook collection
        await UserBook.create(data);
        res.redirect("/myBooks"); // Redirect to the user's purchased books page
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// ReadBook
const fs = require('fs');

// Assuming you have a route like /readBook that receives a bookId parameter
app.get('/readBook', async (req, res) => {
    const { bookId } = req.query;

    try {
        const book = await Book.findById(bookId);
        
        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Assuming book.book contains the PDF buffer
        res.contentType("application/pdf");
        res.send(book.book);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/removeFromCart/:id', async (req, res) => {
    try {
        await UserItsCartBook.findByIdAndDelete(req.params.id);
        res.sendStatus(200); // Send a success status back to the client
    } catch (err) {
        console.error(err);
        res.sendStatus(500); // Send an error status back to the client
    }
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


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
