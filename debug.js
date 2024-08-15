const mongoose = require('mongoose');

// Define Article Schema
const articleSchema = new mongoose.Schema({
  headline: String,
  image: String,
  publishDate: Date,
  mainArticle: String,
  categories: [String],
  location: String
});

// Create Article model
const Article = mongoose.model('Article', articleSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/turbidly', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');

  // Once connected, fetch and print all articles
  Article.find({}, (err, articles) => {
    if (err) {
      console.error('Error fetching articles:', err);
    } else {
      console.log('Articles found:', articles);
    }
  });
})
.catch(err => console.error('MongoDB connection error:', err));