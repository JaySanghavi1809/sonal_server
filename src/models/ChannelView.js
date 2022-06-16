'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ChannelView extends Model {
        static associate(models) {
            ChannelView.belongsTo(models.User, { foreignKey: 'user_id' });
            ChannelView.belongsTo(models.User, { foreignKey: 'creator_id' });
        }
    };
    ChannelView.init({
        user_id: {
            type: DataTypes.INTEGER,
        },
        creator_id: {
            type: DataTypes.INTEGER,
        },
        timestamp_created: {
            type: DataTypes.DATE
        },
        timestamp_edited: {
            type: DataTypes.DATE
        }
    },
        {
            sequelize,
            tableName: 'channel_view',
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
        });
    ChannelView.removeAttribute('id');
    return ChannelView;
};