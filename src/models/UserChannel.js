"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class UserChannel extends Model {
        static associate(models) {
            UserChannel.belongsTo(models.User, { foreignKey: 'user_id' });
            UserChannel.belongsTo(models.TempMaster, { foreignKey: 'Template_id' });

        }
    }
    UserChannel.init(
        {
            user_id: {
                type: DataTypes.INTEGER,
            },
            channel_name: {
                type: DataTypes.STRING,
            },
            Template_id: {
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
            tableName: "user_channel",
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
    UserChannel.associate = function (models) {
    }
    UserChannel.removeAttribute('id');
    return UserChannel;
};
