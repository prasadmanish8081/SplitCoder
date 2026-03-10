import Topic from "../models/Topic.js";

export const createTopic = async (req, res) => {
    const topic = await Topic.create(req.body);
    res.json(topic);
};

export const getTopics = async(req, res) => {
    const topics = await Topic.find().sort({order:1});
    res.json(topics);
};

export const deleteTopic = async(req, res) => {
    await Topic.findByIdAndDelete(req.params.id);
    res.json({success:true});
};

export const updateTopic = async (req, res) => {
    const topic = await Topic.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(topic);
};
