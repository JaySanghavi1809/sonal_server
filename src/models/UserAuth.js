"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class UserAuth extends Model {
        static associate(models) {
            UserAuth.belongsTo(models.User, { foreignKey: 'user_id' });

        }
    }
    UserAuth.init(
        {
            user_id: {
                type: DataTypes.INTEGER,
            },
            type: {
                type: DataTypes.ENUM,
                values: ["facebook", "google"],
            },
            data: {
                type: DataTypes.STRING,
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
            tableName: "user_auth",
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
    UserAuth.associate = function (models) {
    }
    UserAuth.removeAttribute('id');
    return UserAuth;
};
