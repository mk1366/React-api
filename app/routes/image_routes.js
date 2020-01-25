// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for images
const image = require('../models/image')


const customErrors = require('../../lib/custom_errors')


const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership


const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// uploader for image require
const uploadApi = require('../../lib/uploadApi')
const multer = require('multer')
const storage = multer.memoryStorage()
const multerUpload = multer({ storage: storage })

// INDEX
// GET /images
router.get('/images', requireToken, (req, res, next) => {
  image.find()
    .then(images => {
      // `images` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return images.map(image => image.toObject())
    })
    // respond with status 200 and JSON of the images
    .then(images => res.status(200).json({ images: images }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /images/5a7db6c74d55bc51bdf39793
router.get('/images/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  image.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "image" JSON
    .then(image => res.status(200).json({ image: image.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /images
router.post('/images/:phone_id', requireToken, multerUpload.single('file'), (req, res, next) => {
  // set owner of new image to be current user
  console.log('received', req.body)
  console.log(req.body)
  // req.body.image.owner = req.user.id
  uploadApi(req.file, req.params.phone_id)
    .then(awsResponse => {
    // req.body.phone.image = awsResponse.Location
    console.log(awsResponse)
    image.create({
      link: awsResponse.Location,
      owner: req.params.phone_id
    })
      .then(image => {
        res.status(201).json({ image: image.toObject() })
      })
      .catch(next)
    })
})

// UPDATE
// PATCH /images/5a7db6c74d55bc51bdf39793
router.patch('/images/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.image.owner

  image.findById(req.params.id)
    .then(handle404)
    .then(image => {

      requireOwnership(req, image)

      // pass the result of Mongoose's `.update` to the next `.then`
      return image.updateOne(req.body.image)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /images/5a7db6c74d55bc51bdf39793
router.delete('/images/:id', requireToken, (req, res, next) => {
  image.findById(req.params.id)
    .then(handle404)
    .then(image => {
      // throw an error if current user doesn't own `image`
      requireOwnership(req, image)
      // delete the images ONLY IF the above didn't throw
      image.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
