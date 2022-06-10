"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class TempMaster extends Model {
        static associate(models) {
        }
    }
    TempMaster.init(
        {
            Template_name: {
                type: DataTypes.STRING,
            },
            Created_by_user_id: {
                type: DataTypes.INTEGER,
            },
            Locked_user_id: {
                type: DataTypes.INTEGER,
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
            tableName: "temp_master",
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
    return TempMaster;
};
