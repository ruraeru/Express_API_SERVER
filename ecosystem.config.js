module.exports = {
    apps: [{
        name: 'express-server',
        script: 'src/app.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 80
        }
    }]
} 