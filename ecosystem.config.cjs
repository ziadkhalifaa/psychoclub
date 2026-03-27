module.exports = {
  apps: [
    {
      name: 'psychoclub-api',
      script: 'server.ts',
      interpreter: 'node_modules/.bin/tsx',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://psychouser:psychopassword123@localhost:5432/psychoclub',
        JWT_SECRET: 'random_secret_123456'
      }
    }
  ]
};
