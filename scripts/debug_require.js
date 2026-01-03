const fs = require('fs');

async function test() {
    try {
        console.log('Req config'); require('../src/core/config');
        console.log('Req db'); require('../src/core/db');
        console.log('Req logger'); require('../src/core/logger');
        console.log('Req user.service'); require('../src/modules/users/user.service');
        console.log('Req token.service'); require('../src/modules/auth/token.service');
        console.log('Req auth.service'); require('../src/modules/auth/auth.service');
        console.log('ALL IMPORTS OK');
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(e.statck);
        fs.writeFileSync('debug_error.txt', e.stack);
    }
}

test();
