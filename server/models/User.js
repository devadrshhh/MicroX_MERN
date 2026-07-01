const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
<<<<<<< HEAD
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
=======
  password: { type: String, required: true },
>>>>>>> d384997672ab71dcb707c9036acf1852aedf038a
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
<<<<<<< HEAD
  if (!this.password || !this.isModified('password')) return;
  if (/^\$2[ayb]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.password)) return;
=======
  if (!this.isModified('password')) return;
>>>>>>> d384997672ab71dcb707c9036acf1852aedf038a
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
<<<<<<< HEAD
  if (!this.password) return false;
=======
>>>>>>> d384997672ab71dcb707c9036acf1852aedf038a
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
