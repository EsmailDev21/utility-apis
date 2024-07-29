import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';


import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import express from 'express';
import multer from 'multer';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const fbapp = initializeApp(firebaseConfig);
const storage = getStorage(fbapp);

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.post('/api/upload', upload.single('file'), async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
