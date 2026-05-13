const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Material = require('../models/Material');
const { protect } = require('../middleware/auth');
const Payment = require('../models/Payment');

// Upload Material
router.post('/upload', protect, upload.single('pdf'), async (req, res) => {
    try {
        const { title, amount, type, category, stream, classLevel, semester, subject, chapter } = req.body;

        const material = new Material({
            title,
            amount,
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
        res.status(201).json(createdMaterial);

    } catch (error) {
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

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const token = req.headers.authorization?.split(' ')[1] || req.query.token;

        let query = {
            materialId: material._id,
            status: 'Completed'
        };

        if (token) {
            const jwt = require('jsonwebtoken');

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                query.userId = decoded.id;

            } catch (err) {
                console.log('Invalid token');
            }
        }

        const payment = await Payment.findOne(query).sort({ createdAt: -1 });

        if (!payment) {
            return res.status(403).json({
                message: 'Payment not found or not completed'
            });
        }

        res.redirect(material.pdfPath);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
