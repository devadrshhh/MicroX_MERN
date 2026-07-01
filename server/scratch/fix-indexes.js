const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const Material = mongoose.model('Material', new mongoose.Schema({}, { strict: false }));
        const CommunityNote = mongoose.model('CommunityNote', new mongoose.Schema({}, { strict: false }));

        console.log('Dropping indexes for Materials...');
        try {
            await Material.collection.dropIndexes();
            console.log('Materials indexes dropped.');
        } catch (e) {
            console.log('No indexes to drop for Materials or already dropped.');
        }

        console.log('Dropping indexes for CommunityNotes...');
        try {
            await CommunityNote.collection.dropIndexes();
            console.log('CommunityNotes indexes dropped.');
        } catch (e) {
            console.log('No indexes to drop for CommunityNotes or already dropped.');
        }

        console.log('Indexes cleared. Mongoose will recreate them on next run without unique constraints.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixIndexes();
