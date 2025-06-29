import express from 'express';
import Article from '../models/Article.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all articles
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, featured } = req.query;
    
    let query = { published: true };
    
    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Filter by category (tags)
    if (category && category !== 'all') {
      query.tags = { $in: [category.toLowerCase()] };
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    const articles = await Article.find(query)
      .populate('author', 'name avatar bio')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Article.countDocuments(query);
    
    res.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name avatar bio followers following')
      .populate('comments.user', 'name avatar');
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Increment view count
    article.views += 1;
    await article.save();
    
    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: 'Error fetching article', error: error.message });
  }
});

// Create article
router.post('/', auth, async (req, res) => {
  try {
    const { title, subtitle, content, tags, imageUrl } = req.body;
    
    const article = new Article({
      title,
      subtitle,
      content,
      author: req.userId,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
      imageUrl
    });
    
    await article.save();
    await article.populate('author', 'name avatar bio');
    
    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Error creating article', error: error.message });
  }
});

// Update article
router.put('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Check if user is the author
    if (article.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }
    
    const { title, subtitle, content, tags, imageUrl } = req.body;
    
    article.title = title || article.title;
    article.subtitle = subtitle || article.subtitle;
    article.content = content || article.content;
    article.tags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : article.tags;
    article.imageUrl = imageUrl || article.imageUrl;
    
    await article.save();
    await article.populate('author', 'name avatar bio');
    
    res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Error updating article', error: error.message });
  }
});

// Delete article
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Check if user is the author
    if (article.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }
    
    await Article.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Error deleting article', error: error.message });
  }
});

// Like/Unlike article
router.post('/:id/like', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    const isLiked = article.likes.includes(req.userId);
    
    if (isLiked) {
      article.likes.pull(req.userId);
    } else {
      article.likes.push(req.userId);
    }
    
    await article.save();
    
    res.json({
      message: isLiked ? 'Article unliked' : 'Article liked',
      isLiked: !isLiked,
      likeCount: article.likeCount
    });
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({ message: 'Error liking article', error: error.message });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    article.comments.push({
      user: req.userId,
      content
    });
    
    await article.save();
    await article.populate('comments.user', 'name avatar');
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: article.comments[article.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

export default router;