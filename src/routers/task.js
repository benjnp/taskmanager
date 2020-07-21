const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/task', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
        console.log("Error: " + error)
    }
})

router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/task/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        //await task.populate('owner').execPopulate()
        if (!task)
            return res.status(404).send('No task found in your profile')
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/task/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid)
        return res.status(400).send({ Error: 'Invalid update fields' })
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task)
            return res.status(404).send('No task found in your profile')
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/task/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task)
            return res.status(404).send('No task found in your profile')
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router