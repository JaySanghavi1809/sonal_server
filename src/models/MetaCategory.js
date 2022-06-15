"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class MetaCategory extends Model {
        static associate(models) {
            MetaCategory.belongsTo(models.User, { foreignKey: 'owner_id' });
        }
    }
    MetaCategory.init(
        {
            parent_id: {
                type: DataTypes.INTEGER
            },
            owner_id: {
                type: DataTypes.INTEGER
            },
            category_name: {
                type: DataTypes.STRING,
            },
            visibleInSection: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,

            },
            status: {
                type: DataTypes.ENUM,
                values: ["active", "pending", "suspended", "cancelled"],
                defaultValue: "pending",
            },
            timestamp_created: {
                type: DataTypes.DATE,
            },
            timestamp_edited: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            tableName: "meta_category",
            timestamps: false,
            hooks: {
                beforeCreate: (record, options) => {
                    record.dataValues.timestamp_created = new Date();
                    record.dataValues.timestamp_edited = new Date();
                },
                beforeUpdate: (record, options) => {
                    record.dataValues.timestamp_edited = new Date();
                },
            },
        }
    );
    return MetaCategory;
};