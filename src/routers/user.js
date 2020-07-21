const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')

router.post('/user', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send("" + error)
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send("User Logged Out")
    } catch (error) {
        res.status(500).send("" + error)
    }
})

router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send("Users Logged Out")
    } catch (error) {
        res.status(500).send("" + error)
    }
})

router.get('/user/profile', auth, async (req, res) => {
    user = req.user
    await user.populate('tasks').execPopulate()
    res.send({ user, tasks: user.tasks })
})

router.patch('/user/', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password', 'age']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid)
        return res.status(400).send({ Error: 'Invalid update fields' })
    try {
        //const user = await User.findById(req.params.id)
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])

        await user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/user/', auth, async (req, res) => {
    try {
        console.log('Deleting ')
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send('User Deleted')
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload an image file'))

        cb(undefined, true)
    }
})
router.post('/user/upload/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("Profile pic uploaded")
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/user/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Profile pic deleted')
})

router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar)
            throw new Error('Image in fetching an image')
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send("Error in fetching an image")
    }
})

module.exports = router