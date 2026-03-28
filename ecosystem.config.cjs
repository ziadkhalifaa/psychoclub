module.exports = {
  apps: [
    {
      name: 'psychoclub-api',
      script: 'server.ts',
      interpreter: 'node_modules/.bin/tsx',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
