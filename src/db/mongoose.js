const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// const User = mongoose.model('User', {
//     name: {
//         type: String
//     },
//     age: {
//         type: Number
//     },
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true,
//         validate(value) {
//             if (!validator.isEmail(value)) {
//                 throw new Error('Email is invalid')
//             }
//         }
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 7,
//         trim: true,
//         validate(value) {
//             if (value.toLowerCase().includes('password')) {
//                 throw new Error("Password should not contain the word password")
//             }
//         }
//     }
// })

// const me = new User({
//     name: 'benj',
//     age: 38,
//     email: 'benjnp@gmail.com',
//     password: '1234567'
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log("Error: " + error)
// })

// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         required: true,
//         trim: true,
//         minlength: 3
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })

// const task = new Task({
//     description: 'Playing HS'
// })

// task.save().then(() => {
//     console.log(task)
// }).catch((error) => {
//     console.log(error)
// })