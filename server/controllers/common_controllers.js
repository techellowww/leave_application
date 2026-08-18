import { Op } from "sequelize";

export const create = async (req, res, model) => {
  try {
    const data = await model.create(req.body);
    res.status(201).json({ message: "Created successfully", data });
  } catch (error) {
    console.error("Create controller error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const update = async (req, res, model) => {
  try {
    const id = req.params.id;
    const item = await model.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Record not found" });
    }
    await item.update(req.body);
    res.status(200).json({ message: "Updated successfully", data: item });
  } catch (error) {
    console.error("Update controller error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getAll = async (req, res, model, extraFilter = {}) => {
  try {
    const queryFilter = { ...req.query };
    
    // Build clean where object avoiding non-model query params
    const whereConditions = { ...extraFilter };
    
    // Add raw query fields if valid
    const rawModelAttributes = Object.keys(model.rawAttributes || {});
    Object.keys(queryFilter).forEach((key) => {
      if (rawModelAttributes.includes(key)) {
        whereConditions[key] = queryFilter[key];
      }
    });

    const data = await model.findAll({
      where: whereConditions,
      order: model.rawAttributes.createdAt ? [["createdAt", "DESC"]] : [["id", "DESC"]],
    });

    res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.error("GetAll controller error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getOne = async (req, res, model, extraFilter = {}) => {
  try {
    const id = req.params.id;
    const whereConditions = { id, ...extraFilter };
    const data = await model.findOne({ where: whereConditions });
    if (!data) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.error("GetOne controller error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const remove = async (req, res, model) => {
  try {
    const id = req.params.id;
    const item = await model.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Record not found" });
    }
    await item.destroy();
    res.status(200).json({ message: "Deleted successfully", data: item });
  } catch (error) {
    console.error("Remove controller error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};
