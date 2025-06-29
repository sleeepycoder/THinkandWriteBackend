import mongoose from 'mongoose';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Category from '../models/Category.js';

const MONGODB_URI = 'mongodb+srv://pankajschauhan0592:pankaj809080@cluster0.qxcxop3.mongo/scribe-blog?retryWrites=true&w=majority';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Technology', description: 'Latest trends and insights in tech' },
      { name: 'Design', description: 'UI/UX and visual design inspiration' },
      { name: 'Marketing', description: 'Digital marketing strategies and tips' },
      { name: 'Business', description: 'Entrepreneurship and business growth' },
      { name: 'Health', description: 'Wellness and healthy living' },
      { name: 'Travel', description: 'Travel guides and experiences' }
    ]);

    // Create users
    const users = await User.insertMany([
      {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        password: 'password123',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: 'Tech writer and software engineer passionate about AI and web development.'
      },
      {
        name: 'David Rodriguez',
        email: 'david@example.com',
        password: 'password123',
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: 'Design enthusiast sharing insights on UX/UI and creative processes.'
      },
      {
        name: 'Emily Johnson',
        email: 'emily@example.com',
        password: 'password123',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: 'Marketing strategist helping businesses grow through content and storytelling.'
      }
    ]);

    // Create articles
    const articles = [
      {
        title: 'The Future of Artificial Intelligence in Web Development',
        subtitle: 'How AI is revolutionizing the way we build and interact with web applications',
        content: `Artificial Intelligence is no longer a futuristic concept—it's here, and it's transforming web development in unprecedented ways. From automated code generation to intelligent user interfaces, AI is reshaping how we approach building digital experiences.

## The Current Landscape

The integration of AI in web development has accelerated dramatically over the past few years. Tools like GitHub Copilot have shown us glimpses of what's possible when machine learning meets code creation. But this is just the beginning.

## Key Areas of Impact

### 1. Automated Code Generation
AI-powered tools are becoming increasingly sophisticated at understanding developer intent and generating corresponding code. This isn't just about autocomplete—we're seeing entire functions, components, and even full applications being created through natural language descriptions.

### 2. Intelligent Testing
Testing has always been a crucial but time-consuming aspect of development. AI is now capable of generating comprehensive test suites, identifying edge cases that human developers might miss, and even predicting potential bugs before they occur.

### 3. Performance Optimization
Machine learning algorithms can analyze web applications and suggest optimizations that would take human developers hours to identify. From bundle size reduction to database query optimization, AI is becoming an invaluable performance partner.

## Looking Ahead

The next decade will likely see AI becoming as fundamental to web development as version control is today. Developers who embrace these tools early will have a significant advantage in building better applications faster.

The question isn't whether AI will change web development—it's how quickly we can adapt to leverage its full potential.`,
        author: users[0]._id,
        tags: ['ai', 'web development', 'technology', 'future'],
        category: 'Technology',
        imageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
        featured: true
      },
      {
        title: 'Building Accessible Web Applications: A Complete Guide',
        subtitle: 'Creating inclusive digital experiences that work for everyone',
        content: `Web accessibility isn't just a nice-to-have feature—it's a fundamental requirement for creating truly inclusive digital experiences. In this comprehensive guide, we'll explore the principles, techniques, and tools that make web applications accessible to users with diverse abilities.

## Understanding Web Accessibility

Web accessibility means ensuring that websites and applications can be used by people with various disabilities, including visual, auditory, motor, and cognitive impairments. This isn't just about compliance with legal requirements—it's about creating better experiences for all users.

## The Four Principles of Accessibility

### 1. Perceivable
Information and user interface components must be presentable to users in ways they can perceive. This includes providing text alternatives for images, captions for videos, and ensuring sufficient color contrast.

### 2. Operable
User interface components and navigation must be operable. This means making all functionality available from a keyboard, giving users enough time to read content, and not designing content that causes seizures.

### 3. Understandable
Information and the operation of the user interface must be understandable. This involves making text readable and understandable, making content appear and operate in predictable ways.

### 4. Robust
Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

## Practical Implementation

### Semantic HTML
Using proper HTML elements is the foundation of accessibility. Headings, lists, forms, and navigation should use appropriate semantic markup.

### ARIA Attributes
When semantic HTML isn't sufficient, ARIA (Accessible Rich Internet Applications) attributes help provide additional context to screen readers and other assistive technologies.

### Testing and Validation
Regular testing with screen readers, keyboard navigation, and automated accessibility tools ensures your application remains accessible as it evolves.

## Conclusion

Building accessible applications requires ongoing commitment and attention to detail, but the result is a more inclusive web that serves everyone better.`,
        author: users[1]._id,
        tags: ['accessibility', 'web development', 'ux', 'inclusive design'],
        category: 'Design',
        imageUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200',
        featured: true
      }
    ];

    await Article.insertMany(articles);

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();