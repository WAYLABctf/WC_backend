module.exports = {
    apps : [{
        name: "WC_backend",
        script: "./server.js",
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        }
    }]
}