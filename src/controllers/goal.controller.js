const Goal = require('../models/goal.model');

exports.createGoal = async (req, res) => {
  console.log("🏹 createGoal payload:", req.body);
  const { email, label, type, frequency } = req.body;
  const goal = await Goal.create({ email, label, type, frequency });
  res.status(201).json(goal);
};


exports.markComplete = async (req, res) => {
  const goal = await Goal.findById(req.params.goalId);
  if (!goal) return res.status(404).end();
  const now = new Date();
  const last = goal.lastCompleted || goal.createdAt;
  const diffMins = (now - last) / 1000 / 60;
  if (diffMins < goal.frequency) {
    return res.status(400).json({ message: `Too soon: wait ${Math.ceil(goal.frequency - diffMins)} min` });
  }
  goal.lastCompleted = now;
  // optionally increment a streak counter here
  await goal.save();
  res.json(goal);
};

exports.getUserGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ email: req.params.email });
    res.status(200).json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};