require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/community', require('./routes/community'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/settings', require('./routes/settings'));

// Connect Database & Start Server
const startServer = async () => {
    try {
        await connectDB();
        
        // Initial Admin Creation
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminExists = await Admin.findOne({ email: adminEmail });
        if (!adminExists) {
            await Admin.create({
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD
            });
            console.log('Initial Admin Created');
        }

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    
    // Check if it's a Multer error
    if (err.name === 'MulterError') {
        return res.status(400).json({
            message: `Upload Error: ${err.message}`,
            details: err.code
        });
    }

    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred'
    });
});

startServer();
