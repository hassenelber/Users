const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const checkAuth = require("../middleware/check-auth");

const User = require('./UsersModels');
const Token = require('./tokenModel');


router.get('/', checkAuth, (req, res, next) => {
    User.find()
        // .exec()
        .then(docs => {

            const response = {
                count: docs.length,
                events: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        email: doc.email,
                        contactNum: doc.contactNum,
                        balance: doc.balance,
                        settings: doc.settings,
                        role: doc.role,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:7779/users/' + doc._id
                        }
                    }
                })

            }

            if (docs.length >= 0) {
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    message: "No entry found"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:_id', checkAuth, (req, res, next) => {
    const id = req.params._id;
    User.findById(id)
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    event: doc,
                    request: {
                        type: 'GET',
                        description: 'Get all Users',
                        url: 'http://localhost:7779/users'
                    }
                });
            } else {
                res.status(404).json({ message: "No valid entry found" });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
})




router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Email exists"
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {

                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email,
                            contactNum: req.body.contactNum,

                            password: hash,
                            dateOfBirth: req.body.dateOfBirth,
                            gender: req.body.gender,

                            balance: req.body.balance,
                            settings: req.body.settings,
                            role: req.body.role
                        });

                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User Created",
                                    createdUser: user
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ error: err.message })
                            });
                    }
                });
            }
        })






});



router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }

            bcrypt.compare(req.body.password, user.password, (err, response) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if (response) {
                    //synch accessToken
                    const accessToken = jwt.sign(
                        {
                            email: user.email,
                            userId: user._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "20m"
                        });
                        //synch refreshToken
                    const refreshToken = jwt.sign(
                        {
                            email: user.email,
                            userId: user._id
                        },
                        process.env.JWT_KEY_REF

                    );

                    //save refresh token
                    const refresh = new Token({
                        _id: new mongoose.Types.ObjectId(),
                        refToken: refreshToken,
                    });
                    return refresh.save()
                        .then(result => {
                            console.log(result);
                            res.status(200).json({
                                message: "Auth successful",
                                accessToken: accessToken,
                                refreshToken: refreshToken
                            })

                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err,
                                message: "Auth failed",
                            })
                        });


                }
                res.status(401).json({
                    message: "Auth failed"
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});




router.delete('/logout', checkAuth, (req, res, next) => {
    Token.remove({ refToken: req.params.refToken })
        .exec()
        .then(result => {
            console.log("delete", result)
            res.status(204).json({
                message: "Logout successful"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});



router.delete('/:userId', checkAuth, (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            console.log("delete", result)
            res.status(200).json({
                message: "User deleted"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});


router.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.status(401).json({
        message: "Auth failed"
    })
    Token.findOne({ refToken: refreshToken })
        .exec()
        .then(reftok => {

            if (!reftok) {
                return res.status(403).json({
                    message: "Auth failed"
                });
            }
            jwt.verify(refreshToken, process.env.JWT_KEY_REF, (err, user) => {
                console.log("/token", user)
                if (err) return res.status(403)
                const accessToken = jwt.sign(
                    {
                        email: user.email,
                        userId: user._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "20m"
                    });
                res.json({ accessToken: accessToken })
            });


        })
        .catch(err => {
            console.log(err);
            res.status(500)
        });

})


module.exports = router;