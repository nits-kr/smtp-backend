const mongoose = require('mongoose');

const permissionSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        scope: {
            type: String,
            enum: ['system', 'tenant'],
            default: 'tenant',
        },
    },
    {
        timestamps: true,
    }
);

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
