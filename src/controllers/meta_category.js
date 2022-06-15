const { MetaCategory } = require('../models')




exports.CreateCategory = async (req, res) => {
    const { parentId, ownerId, categoryname, visibleinsection } = req.body
    try {
        let CreateCategory = await MetaCategory.create({
            parent_id: parentId,
            owner_id: ownerId,
            category_name: categoryname,
            visibleInSection: visibleinsection,
            status: "active"
        })
        res.status(200).json({
            status: true,
            message: res.__('CATEGORY_CREATED_SUCCESS'),
            CreateCategory
        })

    } catch (e) {
        console.log("Error", e);
        res.send({ status: false, message: e.message });
    }

}
exports.GetAllCategory = async (req, res) => {
    try {
        let GetAllCategory = await MetaCategory.findAll({

        })
        res.status(200).json({
            status: true,
            message: res.__('GET_ALL_CATEGORY'),
            GetAllCategory
        })
    } catch (e) {
        console.log("Error", e);
        res.send({ status: false, message: e.message });
    }
}

exports.GetCategoryById = async (req, res) => {
    const { metaCatId } = req.params;

    try {
        let metaCategory = {};
        if (metaCatId) {
            metaCategory = await MetaCategory.findOne({
                where: { id: metaCatId },
            });
        }

        res.status(200).json({
            status: true,
            message: res.__("SUCCESS_FETCHED"),
            metaCategory,
        });

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: e.message });
    }
}

exports.UpdateCategory = async (req, res) => {
    const { parentId, ownerId, categoryname, visibleinsection } = req.body;
    const { catId } = req.params;
    try {
        if (catId) {
            const updateCategory = await MetaCategory.findOne({
                where: { id: catId },
            }).then(function async(value) {
                if (value) {
                    let updateMetaCat = obj.update(
                        {
                            parent_id: parentId,
                            owner_id: ownerId,
                            category_name: categoryname,
                            visibleInSection: visibleinsection,
                            status: "active"
                        },
                        { where: { id: metaCatId } }
                    );
                    console.log("test", updateMetaCat)

                    return updateMetaCat;
                } else {
                    return res.status(200).json({
                        status: true,
                        message: res.__("NOT_FOUND"),
                    });
                }
            });
        }

        res.status(200).json({
            status: true,
            message: res.__("SUCCESS_UPDATED"),
            updateMetaCategory,

        });
        console.log(updateMetaCategory)

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: e.message });
    }
};
exports.deleteCategory = async (req, res) => {
    const { dispMetaId } = req.params;

    try {
        let disciplineMeta = {};
        // finding profile of logged user
        if (dispMetaId) {
            disciplineMeta = await MetaCategory.destroy({
                where: { discipline_id: dispMetaId },
            });
        }

        res.status(200).json({
            status: true,
            message: res.__("SUCCESS_DELETED"),
            deleted: disciplineMeta ? true : false,
        });

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: e.message });
    }
};