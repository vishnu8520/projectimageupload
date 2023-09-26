const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requireLogin')


// signin up user
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body
    if (!email || !password || !name) {
        return res.status(422).json({ error: "Please enter all fields" })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: "User already exists" })
            }
            bcrypt.hash(password,12)
            .then(hashedpassword=>{
                const user = new User({
                    email,
                    password:hashedpassword,
                    name
                })
                user.save()
                .then(user=>{
                    res.json({message:"User Saved Succesfully"})
                })
                .catch(err=>{
                    console.log(err);
                })
            })

        })
        .catch(err=>{
            console.log(err);
        })
})

router.post('/signin',(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        res.status(422).json({error:"please enter email and password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid Email or Password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email} = savedUser
                res.json({token,user:{_id,name,email}})
            }
            else{
                return res.status(422).json({error:"Invalid Email or Password"})
            }
        })
        .catch(err=>{
            console.log(err);
        })
    })
})

module.exports = router