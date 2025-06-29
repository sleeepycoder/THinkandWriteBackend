import express from 'express';
import User from '../models/User.js';
import Article from '../models/Article.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's articles
    const articles = await Article.find({ author: user._id, published: true })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followerCount,
        following: user.followingCount,
        createdAt: user.createdAt
      },
      articles
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Follow/Unfollow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    const isFollowing = currentUser.following.includes(req.params.id);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(req.params.id);
      userToFollow.followers.pull(req.userId);
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.userId);
    }
    
    await currentUser.save();
    await userToFollow.save();
    
    res.json({
      message: isFollowing ? 'User unfollowed' : 'User followed',
      isFollowing: !isFollowing,
      followerCount: userToFollow.followerCount
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
});

// Get user's bookmarked articles
router.get('/:id/bookmarks', auth, async (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view bookmarks' });
    }
    
    const user = await User.findById(req.userId)
      .populate({
        path: 'bookmarkedArticles',
        populate: {
          path: 'author',
          select: 'name avatar'
        }
      });
    
    res.json(user.bookmarkedArticles);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Error fetching bookmarks', error: error.message });
  }
});

// Bookmark/Unbookmark article
router.post('/bookmark/:articleId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const article = await Article.findById(req.params.articleId);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    const isBookmarked = user.bookmarkedArticles.includes(req.params.articleId);
    
    if (isBookmarked) {
      user.bookmarkedArticles.pull(req.params.articleId);
    } else {
      user.bookmarkedArticles.push(req.params.articleId);
    }
    
    await user.save();
    
    res.json({
      message: isBookmarked ? 'Article unbookmarked' : 'Article bookmarked',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('Bookmark article error:', error);
    res.status(500).json({ message: 'Error bookmarking article', error: error.message });
  }
});

export default router;