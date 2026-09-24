const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const inMemoryRegistrations = [];

app.use(cors());
app.use(express.json());

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    dob: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    department: { type: String, required: true },
    gender: { type: String, required: true },
    year: { type: String, required: true },
    section: { type: String, required: true },
    blacklogs: { type: String, required: true },
    selectedCompanies: { type: [String], required: true },
    submittedAt: { type: String, required: true },
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running successfully.' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/registrations', (req, res) => {
  res.json(inMemoryRegistrations);
});

app.post('/api/register', async (req, res) => {
  const studentData = req.body;

  if (!studentData || !studentData.name || !studentData.rollNo || !studentData.email) {
    return res.status(400).json({ message: 'Name, roll number and email are required.' });
  }

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      const student = await Student.create(studentData);
      return res.status(201).json(student);
    }

    inMemoryRegistrations.unshift(studentData);
    return res.status(201).json(studentData);
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ message: 'Failed to register student.' });
  }
});

const mongoUri = process.env.MONGODB_URI;

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err.message));
} else {
  console.log('MONGODB_URI not found in .env. Starting without MongoDB connection.');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
