const express = require('express');
const usersRouter = express.Router();
const User = require('../models/userSchema');
//GET request for all users
usersRouter.get("/", async (req,res)=>{
    let users = await User.find({},{_id:0});
    res.status(200).send(users);
});
//GET request for user by name
usersRouter.get("/:name", async (req,res)=>{
    let users = await User.find({name: req.params.name});
    res.status(200).send(users);
});
//POST request to add new user
usersRouter.post("/register", async (req,res)=>{
    let user = new User(req.body);
    await user.save();
    res.status(200).send(user);
});
//PUT request to update all user details by name
usersRouter.put("/update/:name", async (req,res)=>{
    let user = await User.updateOne({name: req.params.name}, 
    {$set: req.body});
    res.status(200).send(user);
});
//PUT request to update user job by name
usersRouter.put("/updateJob/:name", async (req,res)=>{
    let user = await User.updateOne({name: req.params.name}, 
    {$set: {job: req.body.job}});
    res.status(200).send(user);
});
module.exports = usersRouter;