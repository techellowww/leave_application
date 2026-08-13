export const create = async (req, res, model) => {
  try {
    const data = await model.create(req.body);
    res.status(201).json({ message: "Created successfully", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const update = async (req, res, model) => {
  try {
    const id = req.params.id;
    const data = await model.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Updated successfully", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getAll = async (req, res, model, extraFilter = {}) => {
  try {
    let filter = { ...req.query, ...extraFilter };
    const data = await model.find(filter);
    res.status(200).json({ message: "Success", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getOne = async (req, res, model, extraFilter = {}) => {
  try {
    const filter = { _id: req.params.id, ...extraFilter };
    const data = await model.findById(filter);
    res.status(200).json({ message: "Success", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const remove = async (req, res, model) => {
  try {
    const id = req.params.id;
    const data = await model.findByIdAndDelete(id);
    res.status(200).json({ message: "Deleted successfully", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
