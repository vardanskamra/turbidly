const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.CMS_PASSWORD || "$2a$10$wZRJwiEpzxdJg6lzZklvT.YDfjoOfPqRqWRar5CqNieA8GgirY.E2";
// hivardaan

// Set up views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/turbidly', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Article Schema
const articleSchema = new mongoose.Schema({
  headline: String,
  image: String,
  publishDate: Date,
  mainArticle: {
      type: String,
      default: '' // Set a default value to avoid undefined
  },
  categories: [String],
  location: String
});

const Article = mongoose.model('Article', articleSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishDate: -1 }).limit(10);
    res.render('index', { articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/article/:id', async (req, res) => {
  try {
      const article = await Article.findById(req.params.id);
      if (!article) {
          res.status(404).send('Article not found');
          return;
      }
      res.render('article', { article }); // Pass article data to the template
  } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const articles = await Article.find({ categories: category }).sort({ publishDate: -1 }).limit(10);
    res.render('category', { category, articles });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/contribute', (req, res) => {
  res.render('contribute');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/cmsadmin', (req, res) => {
  res.render('login');
});

app.get('/cmsadmin/login', (req, res) => {
  res.render('login'); 
});

app.get('/api/latest-news', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishDate: -1 }).limit(10);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching latest news articles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/remove-article/:id', async (req, res) => {
  try {
    await Article.findByIdAndRemove(req.params.id);
    res.json({ message: 'Article removed successfully' });
  } catch (error) {
    console.error('Error removing article:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/cmsadmin/login', async (req, res) => {
  const { password } = req.body;
  try {
    if (await bcrypt.compare(password, PASSWORD)) {
      // Passwords match
      res.render('cmsadmin');
    } else {
      // Passwords don't match
      res.redirect('/cmsadmin?error=invalid');
    }
  } catch (error) {
    console.error('Error comparing passwords:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/cmsadmin/add-article', async (req, res) => {
  const { headline, image, publishDate, mainArticle, categories, location } = req.body;
  try {
      // Save article to the database
      const newArticle = await Article.create({ headline, image, publishDate, mainArticle, categories: categories.split(','), location });
      console.log(`${headline} Article Added`);
      res.redirect('/cmsadmin'); // Redirect to CMS admin after adding article
  } catch (error) {
      console.error('Error adding article:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/cmsadmin/remove-article/:id', async (req, res) => {
  // Remove article from the database
  try {
    await Article.findByIdAndRemove(req.params.id);
    res.redirect('/cmsadmin');
  } catch (error) {
    console.error('Error removing article:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

