const express = require('express');
const authRoute = require('../../modules/auth/auth.routes');
const userRoute = require('../../modules/users/user.routes');
const emailRoute = require('../../modules/email/email.routes');
const campaignRoute = require('./campaign.route');


const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/users',
        route: userRoute,
    },
    {
        path: '/email',
        route: emailRoute,
    },
    {
        path: '/campaigns',
        route: campaignRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
