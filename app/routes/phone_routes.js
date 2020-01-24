// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for phones
const Phone = require('../models/phone')

// pull in Mongoose model for images
const image = require('../models/image')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { phone: { title: '', text: 'foo' } } -> { phone: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// uploader for image require
const uploadApi = require('../../lib/uploadApi')
const multer = require('multer')
const storage = multer.memoryStorage()
const multerUpload = multer({ storage: storage })

// INDEX
// GET /phones
router.get('/phones', requireToken, (req, res, next) => {
  Phone.find()
    .then(phones => {
      // `phones` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return phones.map(phone => phone.toObject())
    })
    // respond with status 200 and JSON of the phones
    .then(phones => res.status(200).json({ phones: phones }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /phones/5a7db6c74d55bc51bdf39793
router.get('/phones/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Phone.findById(req.params.id)
    .populate('image')
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "phone" JSON
    .then(phone => res.status(200).json({ phone: phone.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /phones
router.post('/phones', requireToken, multerUpload.single('file'), (req, res, next) => {
  req.body.phone.owner = req.user.id
  console.log('crete phone',req.body.phone)

  Phone.create(req.body.phone)
    // respond to succesful `create` with status 201 and JSON of new "phone"
    .then(phone => {
      console.log('phone id is:', phone._id)
      res.status(201).json({ phone: phone.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /phones/5a7db6c74d55bc51bdf39793
router.patch('/phones/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.phone.owner

  Phone.findById(req.params.id)
    .then(handle404)
    .then(phone => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, phone)

      // pass the result of Mongoose's `.update` to the next `.then`
      return phone.updateOne(req.body.phone)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /phones/5a7db6c74d55bc51bdf39793
router.delete('/phones/:id', requireToken, (req, res, next) => {
  Phone.findById(req.params.id)
    .then(handle404)
    .then(phone => {
      // throw an error if current user doesn't own `phone`
      requireOwnership(req, phone)
      // delete the phone ONLY IF the above didn't throw
      phone.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
