const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.use(express.static(path.join(__dirname, '../public')));
router.get('/search',(req,res)=>{
  res.render('search')
})
router.get('/', (req, res) => {
  res.render('login', { title: 'Login', message: null });
});
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up', message: null });
});
router.get('/home', (req, res) => {
  res.render('home', { title: 'Home', user: req.session.user });
});
router.post('/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('signup', { title: 'Sign Up', message: 'Passwords do not match.' });
  }

  try {
    const existing = await User.findOne({ email });
    const existingUsername = await User.findOne({username});
    if (existing) {
      return res.render('signup', { title: 'Sign Up', message: 'User already exists.' });
    }
    if (!username || !email || !password) {
      return res.render('signup', { title: 'Sign Up', message: 'All fields are required.' });
    } 
    if (password.length < 6) {
      return res.render('signup', { title: 'Sign Up', message: 'Password must be at least 6 characters long.' });
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return res.render('signup', { title: 'Sign Up', message: 'Username can only contain letters and numbers.' }); 
    }
    if (existingUsername){
      return res.render('signup', { title: 'Sign Up', message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    req.session.user = { _id: user._id, username: user.username, email: user.email };
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.render('signup', { title: 'Sign Up', message: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const username=await User.findOne({username:email});
    if (!user) {
      return res.render('login', { title: 'Login', message: 'User not found' });
    }


    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { title: 'Login', message: 'Incorrect password' });
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    res.redirect('/home');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { title: 'Login', message: 'Login failed' });
  }
});
router.get('/explore',(req,res)=>{
  res.render('explore');
})
router.get('/reel',(req,res)=>{
  res.render('reel')
})
router.get('/messages',(req,res)=>{
  res.render('message');
})
router.get('/likes', (req, res) => {
  res.render('likes');
});
router.get('/postcreate',(req,res)=>{
  res.render('createpost');
})
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.render('profile', { user: req.session.user });
}); 
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
