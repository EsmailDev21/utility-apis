const express = require('express');
const upload = require('./multer-config');
const bucket = require('./firebase-admin');

const router = express.Router();

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const file = req.file;
    console.log(res.file)
    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (error) => {
      res.status(500).send({ error: error.message });
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      // Optionally, set the file to be publicly readable
      await blob.makePublic();

      res.status(200).send({ fileName: file.originalname, fileLocation: publicUrl });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
