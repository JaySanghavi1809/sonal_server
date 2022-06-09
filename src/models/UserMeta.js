"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class UserMeta extends Model {
        static associate(models) {
            UserMeta.belongsTo(models.User, { foreignKey: 'user_id' });

        }
    }
    UserMeta.init(
        {
            user_id: {
                type: DataTypes.INTEGER,
            },
            type: {
                type: DataTypes.ENUM,
                values: ["email", "phone", "customerStripeId"],
            },
            sort_order: {
                type: DataTypes.INTEGER,
            },
            data: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING
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
            tableName: "user_meta",
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
    UserMeta.associate = function (models) {
    }
    UserMeta.removeAttribute('id');
    return UserMeta;
};
