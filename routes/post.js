const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Post = mongoose.model("Post")
const requireLogin = require('../middleware/requireLogin')

router.get('/allpost',(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err);
    })
})

router.post('/createpost', requireLogin ,(req, res) => {
    const { title,pic } = req.body;

    if (!title || !pic ) {
        return res.status(422).json({ error: "Please add all fields" });
    }
    req.user.password=undefined
    const post = new Post({
        title,
        photo:pic,
        postedBy: req.user
    });

    post.save()
        .then(result => {
            res.json({ post: result });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Could not save the post" });
        });
});

// login user post
router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy", "_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err);
    })
})

// delete
router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
      .populate('postedBy','_id')
      .then((post) => {
        if (!post) {
          return res.status(422).json({ error: 'Post not found' });
        }
  
        if (post.postedBy._id.toString() !== req.user._id.toString()) {
          return res.status(401).json({ error: 'You are not authorized to delete this post' });
        }

        post.deleteOne()
          .then((result) => {
            res.json(result);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal server error' });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
      });
  });
  

module.exports = router