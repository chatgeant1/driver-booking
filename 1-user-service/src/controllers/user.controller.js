import User from "../models/user.model.js"

export const getAll = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

export const create = async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
};

export const update = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {new: true}
    )
    res.json(user)
}

export const health = (req, res) => {
    res.json({ service: 'user-service', status: 'healthy' });
}

export const getOne = async (req, res) => {
    const user = await User.findById(req.params.id)
    if(!user) return res.status(404).json({message: "Not found"})
    res.json(user)
}

export const remove = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if(!user) return res.status(404).json({message: "Not found"})
    res.json({message: "Deleted"})
}

