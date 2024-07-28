// upload.js
import { storage } from './firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import express from 'express';
import multer from 'multer';
import { Router } from 'express';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const storageRef = ref(storage, `uploads/${file.originalname}`);
        const metadata = {
            contentType: file.mimetype,
        };

        const uploadTask = uploadBytesResumable(storageRef, file.buffer, metadata);

        uploadTask.on('state_changed', 
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, 
            (error) => {
                // Handle unsuccessful uploads
                console.error(error);
                res.status(500).send(error);
            }, 
            async () => {
                // Handle successful uploads on complete
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                res.status(200).send({ url: downloadURL });
            }
        );
    } catch (error) {
        res.status(500).send(error.message);
    }
});


export default router