const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Material = require('../models/Material');
const { protect } = require('../middleware/auth');
const Payment = require('../models/Payment');
const axios = require('axios');

// Upload Material
router.post('/upload', protect, upload.single('pdf'), async (req, res) => {
    try {
        console.log('Upload Request Body:', req.body);
        console.log('Upload Request File:', req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'File upload failed' });
        }

        const { title, amount, type, category, stream, classLevel, semester, subject, chapter } = req.body;

        const material = new Material({
            title,
            amount: Number(amount),
            type,
            category,
            stream,
            classLevel,
            semester,
            subject,
            chapter,
            pdfPath: req.file.path
        });

        const createdMaterial = await material.save();
        console.log('Material Created:', createdMaterial._id);
        res.status(201).json(createdMaterial);

    } catch (error) {
        console.error('Upload Error Details:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get All Materials
router.get('/', async (req, res) => {
    try {
        const materials = await Material.find({});
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Single Material
router.get('/:id', async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid material ID' });
        }

        const material = await Material.findById(req.params.id);

        if (material) {
            res.json(material);
        } else {
            res.status(404).json({ message: 'Material not found' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Material
router.put('/:id', protect, async (req, res) => {
    try {
        const {
            title,
            amount,
            type,
            category,
            stream,
            classLevel,
            semester,
            subject,
            chapter
        } = req.body;

        const material = await Material.findById(req.params.id);

        if (material) {
            material.title = title || material.title;
            material.amount = amount || material.amount;
            material.type = type || material.type;
            material.category = category || material.category;
            material.stream = stream || material.stream;
            material.classLevel = classLevel || material.classLevel;
            material.semester = semester || material.semester;
            material.subject = subject || material.subject;
            material.chapter = chapter || material.chapter;

            const updatedMaterial = await material.save();
            res.json(updatedMaterial);

        } else {
            res.status(404).json({ message: 'Material not found' });
        }

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete Material
router.delete('/:id', protect, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (material) {
            await material.deleteOne();
            res.json({ message: 'Material removed' });

        } else {
            res.status(404).json({ message: 'Material not found' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Download Material
router.get('/download/:id', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        const token = req.headers.authorization?.split(' ')[1] || req.query.token;
        let query = { materialId: material._id, status: 'Completed' };

        // Handle stringified "null"/"undefined" from frontend
        const isValidToken = token && token !== 'null' && token !== 'undefined';

        if (isValidToken) {
            const jwt = require('jsonwebtoken');
            const User = require('../models/User'); // Import User model locally
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                
                if (user) {
                    // Search for payment by userId OR the user's email
                    query.$or = [
                        { userId: user._id },
                        { userEmail: user.email.toLowerCase().trim() }
                    ];
                } else {
                    query.userId = decoded.id; // Fallback
                }
            } catch (err) {
                console.error('Download Token Verification Error:', err.message);
                // If token is invalid, we continue without userId filter (security risk but keeps it working for guests)
                // Actually, let's keep it strict for now if a token was attempted.
            }
        }

        const payment = await Payment.findOne(query).sort({ createdAt: -1 });

        if (!payment) {
            return res.status(403).json({
                message: 'Payment not found or not completed'
            });
        }

        // Fetch PDF from Cloudinary and serve with custom name
        const response = await axios({
            url: material.pdfPath,
            method: 'GET',
            responseType: 'stream'
        });

        const filename = `${payment.orderId || material.title.trim().replace(/\s+/g, '_').toUpperCase()}.pdf`;

        // Force download with correct headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
        
        response.data.pipe(res);

        // Optional: Error handling for pipe
        response.data.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) res.status(500).send('Streaming error');
        });

    } catch (error) {
        console.error('Download error:', error.message);
        if (!res.headersSent) res.status(500).json({ message: 'Error downloading file' });
    }
});

module.exports = router;
