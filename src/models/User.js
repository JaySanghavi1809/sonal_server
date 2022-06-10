"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            console.log(models)
        }
    }
    User.init(
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            first_name: {
                type: DataTypes.STRING,
            },
            last_name: {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING
            },
            otp: {
                type: DataTypes.INTEGER
            },
            otp_exp_time: {
                type: DataTypes.TIME
            },
            item_profile_id: {
                type: DataTypes.INTEGER
            },
            item_cover_id: {
                type: DataTypes.INTEGER
            },
            post_about_id: {
                type: DataTypes.INTEGER
            },
            tooltip_status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
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
            tableName: "user",
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

    User.removeAttribute('id');
    return User;
};
