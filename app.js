const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

/* ## MongoDB relevant ## */

// Create 'blogDB' database, connect to it
mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

// Create a schema for the posts
const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Blog post title can't be empty."]
    },
    content: {
        type: String,
        required: [true, "Blog post body can't be empty."]
    }
});

// Create a Post model (and 'posts' collection)  
const Post = mongoose.model("Post", postSchema);


/* ## Express server relevant ## */

const app = express();
app.set("view engine", "ejs"); // use EJS as view engine
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); // use 'public/' for static files

// Text to pass the home page
const homeStartingContent = "This is a simple blogging web application. Click on the 'CREATE POST' link to create a new post with a title and a body. After you're done composing, click on 'Publish Post' and you'll be redirected to the home page where a part of it will be displayed. Click on the 'Read More' link beside each post you create, and you'll navigate to the respective post's page with the full post body text shown. While there, click on 'Delete Post' to delete the post and you'll navigate to the home page after the respective post is deleted.";
// const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
// Array that holds all the new blog posts
// let posts = [];

app.get("/", (req, res) => {
    // Search database for blog posts
    Post.find({}, (err, foundPosts) => {
        if (err) {
            console.log(err);
        } else {
            res.render("home", {startingContent: homeStartingContent, blogPosts: foundPosts});
        }
    });
});

app.get("/about", (req, res) => {
    res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", (req, res) => {
    res.render("contact", {contactContent: contactContent});
});

app.get("/compose", (req, res) => {
    res.render("compose");
});

app.post("/compose", (req, res) => {
    // Create a new 'Post' document from data from request body
    const post = new Post({
        title: req.body.postTitle,
        content: req.body.postBody
    });
    // Save new document to database; redirect to "/" GET if all well
    post.save(err => {
        if (!err) {
            res.redirect("/"); // redirect to the "/" GET route
        } else {
            console.log(err);
        }
    });
});

app.get("/posts/:postId", (req, res) => {
    // Get the requested post's _id parameter from 'req.params'
    const requestedPostId = req.params.postId;
    // Search database for post with same _id
    Post.findOne({_id: requestedPostId}, (err, foundPost) => {
        if (!err) {
            res.render("post", {title: foundPost.title, content: foundPost.content, id: requestedPostId});
        } else {
            console.log(err);
            res.render("post", {title: "Not Found", content: ""});
        }
    });
});

app.post("/delete", (req, res) => {
    // Get id of post to be deleted from request body (passed from post.ejs btn)
    const requestedId = req.body.deleteButton;
    // Search database for post and delete; redirect to home route
    Post.findByIdAndDelete({_id: requestedId}, (err) => {
        if (!err) {
            // console.log("Blog post successfully deleted!");
            res.redirect("/");
        } else {
            console.log(err);
        }
    });
});

// In case it's deployed from Heroku where the port is dynamic, from the env
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
} 

app.listen(port, () => {
    console.log("Server is up and running on port 3000");
});