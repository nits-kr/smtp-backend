const httpStatus = require('http-status');
const User = require('./models/user.model');
const ApiError = require('../../core/ApiError');

const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    if (userBody.role) {
        const Role = require('./models/role.model');
        const roleDoc = await Role.findOne({ name: userBody.role });
        console.log('Lookup Role:', userBody.role, 'Found:', roleDoc ? roleDoc._id : 'null');
        if (roleDoc) {
            userBody.roles = [roleDoc._id];
            console.log('Assigned Roles:', userBody.roles);
        }
    }

    const user = await User.create(userBody);
    await user.populate('roles');
    return user;
};

const getUserById = async (id) => {
    return User.findById(id).populate('roles');
};

const getUserByEmail = async (email) => {
    return User.findOne({ email }).populate('roles');
};

const updateUserById = async (userId, updateBody) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
};

const deleteUserById = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await user.deleteOne();
    return user;
};

const queryUsers = async (filter, options) => {
    const users = await User.find(filter)
        .sort(options.sortBy)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .populate('roles');

    const count = await User.countDocuments(filter);

    return {
        results: users,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(count / options.limit),
        totalResults: count,
    };
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    updateUserById,
    deleteUserById,
    queryUsers,
};
