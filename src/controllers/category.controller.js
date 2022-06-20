const { MetaCategory } = require('../models')
const { Op } = require("sequelize");
const validators = require('../validators/user.validate.schema')

exports.CreateCategory = async (req, res) => {
    try {
        const category = await MetaCategory.create({
            parent_id: req.body.parent_id,
            owner_id: req.user.user_id,
            category_name: req.body.category_name,
            visibleInSection: req.body.visibleInSection,
            status: "active"
        })
        res.status(200).json({
            status: true,
            message: res.__('CATEGORY_CREATED_SUCCESS'),
            category
        })
    } catch (e) {
        console.log("Error", e);
        res.send({ status: false, message: e.message });
    }
}
exports.GetAllCategory = async (req, res) => {
    console.log("req.user.user_id", req.user)
    const category_name = req.query.category_name;
    var cat_name = category_name ? { category_name: { [Op.like]: `%${category_name}%` } } : null;
    try {
        const category = await MetaCategory.findAll({ where: cat_name });
        res.status(200).json({
            status: true,
            message: res.__('GET_ALL_CATEGORY'),
            category
        })

    } catch (e) {
        console.log("Error", e);
        res.send({ status: false, message: e.message });

    }
}

exports.GetCategoryById = async (req, res) => {
    const { metaCatId } = req.params;
    try {
        const category = await MetaCategory.findOne({
            where: { id: metaCatId },
        });
        res.status(200).json({
            status: true,
            message: res.__('FETCHED_CATEGORY'),
            category
        })

    } catch (e) {
        console.log("Error", e);
        res.send({ status: false, message: e.message });

    }
}
exports.deleteCategory = async (req, res) => {
    try {
        let deletedata = await MetaCategory.destroy({ where: { id: req.body.id } });
        if (deletedata) {
            res.status(200).json({
                status: true,
                message: res.__('DELETED_CATEGORY'),
                deletedata
            });
        }
    } catch (e) {
        console.log("Error", e);
        res.send({ status: false, message: e.message });
    }
}

exports.UpdateCategory = async (req, res) => {
    try {
        let finddata = await MetaCategory.findAll({ where: { id: req.body.id } });
        if (finddata.length > 0) {
            finddata.forEach(async data => { await data.update(req.body) })
        }
        res.status(200).json({
            status: true,
            message: res.__('UPDATE_CATEGORY'),
            finddata
        });
    } catch (e) {
        console.log("Error", e);
        res.send({ status: false, message: e.message });
    }
}

