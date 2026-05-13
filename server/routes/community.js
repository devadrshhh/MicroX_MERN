const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CommunityNote = require('../models/CommunityNote');
const { protect } = require('../middleware/auth');

// Ensure directory exists
const uploadDir = 'uploads/community';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Setup
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(null, `community-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|ppt|pptx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, and PPT are allowed.'));
        }
    }
});

// @route   POST /api/community/upload
// @desc    User uploads a free note (Pending Approval)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { title, description, type, category, stream, classLevel, semester, subject, chapter, uploadedBy } = req.body;
        
        const note = new CommunityNote({
            title, description, type, category, stream, classLevel, semester, subject, chapter,
            uploadedBy: uploadedBy || 'Anonymous',
            filePath: req.file.path,
            fileType: path.extname(req.file.originalname).toLowerCase(),
            isApproved: false
        });

        const createdNote = await note.save();
        res.status(201).json({ message: 'Upload successful. Pending admin approval.', note: createdNote });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/community/approved
// @desc    Get all approved free notes
router.get('/approved', async (req, res) => {
    try {
        const notes = await CommunityNote.find({ isApproved: true }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/community/pending
// @desc    Get all pending requests (Admin only)
router.get('/pending', protect, async (req, res) => {
    try {
        const notes = await CommunityNote.find({ isApproved: false }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/community/approve/:id
// @desc    Approve a note (Admin only)
router.put('/approve/:id', protect, async (req, res) => {
    try {
        const note = await CommunityNote.findById(req.params.id);
        if (note) {
            note.isApproved = true;
            await note.save();
            res.json({ message: 'Note approved and published' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/community/:id
// @desc    Reject/Delete a note (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const note = await CommunityNote.findById(req.params.id);
        if (note) {
            // Delete file from filesystem
            if (fs.existsSync(note.filePath)) {
                fs.unlinkSync(note.filePath);
            }
            await note.deleteOne();
            res.json({ message: 'Note rejected and removed' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/community/like/:id
// @desc    Like a note
router.post('/like/:id', async (req, res) => {
    try {
        const note = await CommunityNote.findById(req.params.id);
        if (note) {
            note.likes += 1;
            await note.save();
            res.json({ likes: note.likes });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/community/download/:id
// @desc    Download a note file instantly
router.get('/download/:id', async (req, res) => {
    try {
        const note = await CommunityNote.findById(req.params.id);
        if (note) {
            const filePath = path.resolve(note.filePath);
            if (fs.existsSync(filePath)) {
                note.downloadCount += 1;
                await note.save();
                res.download(filePath, `${note.title}${note.fileType}`);
            } else {
                res.status(404).json({ message: 'File not found on server' });
            }
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
