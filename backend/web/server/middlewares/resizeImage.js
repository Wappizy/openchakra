const sharp = require('sharp')
const {sanitizeFilename, generateUUID} = require('../../utils/functions')
const {IMAGES_WIDTHS_FOR_RESIZE, IMAGE_SIZE_MARKER, THUMBNAILS_DIR} = require('../../utils/consts')
const {IMAGE_SIZE_SEPARATOR, IMAGE_SETTINGS, switchbuffer} = require('../utils/images')


exports.resizeImage = async(req, res, next) => {
  if (!req.file) { return next() }

  const isDocumentFromStudio = Boolean(req.body.fromstudio)
 
  req.body.documents = []

  const filemimetype = req.file.mimetype
  const isImage = Object.keys(IMAGE_SETTINGS).includes(filemimetype)
  
  // filename is prefixed with uuid, and sanitized
  const uploadedfilename = `${generateUUID()}_${sanitizeFilename(req.file.originalname)}`
  const rootPath = isDocumentFromStudio ? process.env.S3_STUDIO_ROOTPATH : process.env.S3_PROD_ROOTPATH
  const uploadedfilenamebase = uploadedfilename.substring(0, uploadedfilename.lastIndexOf('.'))
 
  if (isImage) {
    let availableSizes = []
    const buffer = await switchbuffer(req.file.buffer, filemimetype)
    // watch out for original image width
    const {width: originalWidth} = await sharp(buffer)
      .metadata()
      .then(metadata => {
        return {
          width: metadata.width,
        }
      })
      .catch(err => {
        throw Error('Error while obtaining image dimensions :', err)
      })

    const retainedImageSizes = IMAGES_WIDTHS_FOR_RESIZE
      .filter(size => size < originalWidth)
      .sort((a, b) => a - b)
      
    const imagesSet = new Set([...retainedImageSizes, originalWidth])

    const sharpImages = [...imagesSet].map(width => {

      return new Promise(async(resolve, reject) => {
        availableSizes.push(width)
        const image = await sharp(buffer)
          .resize({width})
          .toFormat(IMAGE_SETTINGS[filemimetype].outputFormat, IMAGE_SETTINGS[filemimetype].options)
          .toBuffer()
          .catch(err => reject(err))


        const imageData = {
          filename: originalWidth === width // spread availables image dimensions on original file. Others in thumbnails dir
            ? `${rootPath}/${uploadedfilenamebase}${IMAGE_SIZE_MARKER}${availableSizes.join(IMAGE_SIZE_SEPARATOR)}.${IMAGE_SETTINGS[filemimetype].extension}`
            : `${THUMBNAILS_DIR}/${rootPath}/${uploadedfilenamebase}_w:${width}.${IMAGE_SETTINGS[filemimetype].extension}`,
          mimetype: IMAGE_SETTINGS[filemimetype].outputMime,
          buffer: image,
        }
        req.body.documents.push(imageData)
        resolve(image)
      })
    })
    
    await Promise.all(sharpImages)
      .catch(err => console.error(err))

  }
  else {
    req.body.documents.push({
      filename: `${rootPath}/${uploadedfilename}`,
      mimetype: req.file.mimetype,
      buffer: req.file.buffer,
    })
  }

  next()
}
