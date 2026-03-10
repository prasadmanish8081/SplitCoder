import Tutorial from "../models/Tutorial.js";

export const getTutorials = async (req, res) => {
  const tutorials = await Tutorial.find().sort({ order: 1, createdAt: -1 });
  res.json(tutorials);
};

export const createTutorial = async (req, res) => {
  const tutorial = await Tutorial.create(req.body);
  res.json(tutorial);
};

export const updateTutorial = async (req, res) => {
  const tutorial = await Tutorial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(tutorial);
};

export const deleteTutorial = async (req, res) => {
  await Tutorial.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
