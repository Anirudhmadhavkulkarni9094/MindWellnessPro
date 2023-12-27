
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const UserResponseModel = require("./Model/UserResponse");
const cors = require("cors");
const sendEmailWithCode = require("./sendEmailWithCode/sendEmailWithCode");
const Report = require("./Router/Report");
const UserResponse = require("./Router/UserResponse");
const Question = require("./Router/Question");
const Forum = require("./Router/Forum");
const Complaints = require("./Router/Complaints");
const BlogPost =  require("./Router/BlogPost");
const UserLoginAndSignUp = require("./Router/UserLoginAndSignUp")
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://anirudhkulkarni9094:TRb8AwPW6444ymuh@mindwellpro.h2ryfbt.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(console.log("Connected successfully"))
  .catch((Err) => console.log(Err));
app.use(express.json());

app.get("/UserResponse", async (req, res) => {
  const data = await UserResponseModel.find({});

  res.status(200).json({
    DataLength: data.length,
    data: data,
  });
});

//user Response apis
app.get("/UserResponse/:mail", UserResponse.getResponseById);
app.delete("/UserResponse/:id", UserResponse.deleteResponseById);
app.delete("/deleteAllResponse", UserResponse.deleteAllResponse);
app.post("/UserResponse", UserResponse.addUserResponse);

// Report apis
app.get("/getReports/:mail/:id", Report.getReportByMailAndID);
app.post("/getReport", Report.getReportForDownload);
app.delete("/deleteAllReports",Report.deleteAllReports);
app.delete("/deleteReport/:id",Report.deleteReportById);
app.get("/getReport", Report.getAllReport);

app.post("/reports/:mail", async (req, res) => {
  const userEmailAddress = req.params.mail; // Replace this with the user's email
  const result = await sendEmailWithCode(userEmailAddress);
  res.status(200).json({
    UniqueId: result.code,
  });
});

//Question APIs
app.get("/questions", Question.getQuestions);
app.post("/questions", Question.addQuestion);
app.delete("/questions/:id", Question.deleteQuestionbyId);

//forum APIs
app.get("/Forum/:category", Forum.getForumByCategory);
app.post("/forum",Forum.addForum);

//blog-post APIs
app.get("/blog-posts/:Category", BlogPost.getBlogsByCategory);
app.post("/blog-posts", BlogPost.addBlogPost);
app.get("/blog-posts/:id", getBlogPost, (req, res) => {
  res.json(res.blogPost);
});

// Middleware function to get a specific blog post by ID
async function getBlogPost(req, res, next) {
  let blogPost;
  try {
    blogPost = await BlogPost.findById(req.params.id);
    if (blogPost == null) {
      return res.status(404).json({ message: "Blog post not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.blogPost = blogPost;
  next();
}

app.delete("/blog-posts/:id", BlogPost.deleteBlogPost);
app.post("/blog-posts/:id/comment", getBlogPost, BlogPost.addCommentToBlog);

// COMPLAINT APIs
app.post("/addComplaint", Complaints.addComplaint);
app.get("/complaint/:Status", Complaints.getComplaintsByStatus);
app.delete("/complaint/:id",Complaints.deleteComplaintById);
app.patch("/complaint/:id/status", Complaints.updateComplaintStatus);

//login and signup  APIs
app.post('/register', UserLoginAndSignUp.addNewUser);
app.put('/promote-to-superadmin/:adminId', UserLoginAndSignUp.promotionToSuperAdminById);
app.put('/demote-to-superadmin/:adminId', UserLoginAndSignUp.demotionToAdminById);
app.put("/approveLogin/:id" , UserLoginAndSignUp.admitAdmin);
app.put("/disapproveLogin/:id" , UserLoginAndSignUp.rejectAdminRequest);
app.post('/login', UserLoginAndSignUp.login);
app.get("/getAdmin" , UserLoginAndSignUp.fetchAllAdmin);

const admin = require('firebase-admin');
const serviceAccount = require('./mindwellnesspro-123-firebase-adminsdk-dx76c-fbff8c0699.json');
const multer = require('multer');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.body.title || !req.body.description) {
      return res.status(400).json({ error: 'Please provide an image, title, and description.' });
    }
    const bucket = admin.storage().bucket('gs://portfolio-e45aa.appspot.com/');
    const uniqueFilename = `CodeSnippet/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(uniqueFilename);

    // Upload the image to Firebase Cloud Storage
    await file.createWriteStream().end(req.file.buffer);

    // Get the public URL of the uploaded image
    const [publicUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2025', // Set an appropriate expiration date
    });

    // Store the image URL, title, and description in MongoDB
    const image = new Images({
      imageUrl: publicUrl,
      title: req.body.title,
      description: req.body.description,
      category : req.body.category
      // Add other fields as needed
    });

    await image.save();

    res.json({ imageUrl: publicUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'An error occurred while uploading the image.' });
  }
});

app.listen(3001, () => {
  console.log("port running at 3001");
});
// anirudhkulkarni9094
// TRb8AwPW6444ymuh
