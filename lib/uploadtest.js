require('dotenv').config()
const AWS = require('aws-sdk')
const fs = require('fs')
const mime = require('mime-types')


const s3 = new AWS.S3()

AWS.config.update({
  region: 'us-east-1'
})
const bucketName = process.env.BUCKET_NAME

const filePath = process.argv[2]

fs.readFile(filePath, (err, fileData) => {
  if(err) {
    throw err
  }
    const params = {
      Bucket: bucketName,
      Key: `Ecommerce/s3test`,
      Body: fileData,
      ACL: 'public-read',
      ContentType: mime.lookup(filePath)

    }
    s3.upload(params, (err, s3Data) => {
      if (err) reject(err)
      console.log(s3Data)

    })
})
