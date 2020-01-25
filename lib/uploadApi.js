require('dotenv').config()
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId : process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET
})

AWS.config.update({
  region: 'us-east-1'
})
const bucketName = process.env.BUCKET_NAME

module.exports = function(file, itemId) {
return new Promise((resolve, reject) => {
const params = {
  Bucket: bucketName,
  Key: `Ecommerce/${itemId}`,
  Body: file.buffer,
  ACL: 'public-read',
  contentType: file.mimetype

}
s3.upload(params, (err, s3Data) => {
  if (err) reject(err)
  resolve(s3Data)
})
})
}
