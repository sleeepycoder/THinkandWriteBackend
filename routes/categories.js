import express from 'express';
import Category from '../models/Category.js';
import Article from '../models/Article.js';

const router = express.Router();

// Get all categories with article counts
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().populate('articleCount');
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Technology', description: 'Latest trends and insights in tech' },
        { name: 'Design', description: 'UI/UX and visual design inspiration' },
        { name: 'Marketing', description: 'Digital marketing strategies and tips' },
        { name: 'Business', description: 'Entrepreneurship and business growth' },
        { name: 'Health', description: 'Wellness and healthy living' },
        { name: 'Travel', description: 'Travel guides and experiences' }
      ];

      await Category.insertMany(defaultCategories);
      const newCategories = await Category.find().populate('articleCount');
      return res.json({ categories: newCategories });
    }

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// Get articles by category
router.get('/:name/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const articles = await Article.find({ 
      category: req.params.name,
      published: true 
    })
      .populate('author', 'name avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments({ 
      category: req.params.name,
      published: true 
    });

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArticles: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get category articles error:', error);
    res.status(500).json({ message: 'Server error while fetching category articles' });
  }
});

export default router;