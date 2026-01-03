const mongoose = require('mongoose');

const roleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Permission',
            },
        ],
        isSystem: {
            type: Boolean,
            default: false,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant', // Future-proofing for Tenant model
            required: function () {
                return !this.isSystem; // Tenant ID required if not a system role
            },
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index to ensure role names are unique per tenant (or globally for system)
roleSchema.index({ name: 1, tenantId: 1 }, { unique: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
