import admin from 'firebase-admin';
import fs from 'fs';

const initFirebase = () => {
    try {
        // Check if the file exists before trying to read it
        if (!fs.existsSync('./firebase-service-account.json')) {
            console.log('Firebase key file not found, skipping initialization.');
            return;
        }

        // Read the file and parse it into a JavaScript object
        const rawData = fs.readFileSync('./firebase-service-account.json', 'utf-8');
        const serviceAccount = JSON.parse(rawData);
        
        // Initialize Firebase only if no apps exist
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase initialized successfully');
        } else {
            console.log('Firebase already initialized, skipping.');
        }
    } catch (error) {
        console.error(`Error initializing Firebase: ${error.message}`);
        process.exit(1);
    }
};

export default initFirebase;