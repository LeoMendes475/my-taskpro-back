// Silence winston logs during tests
process.env.LOG_LEVEL = "silent";
process.env.JWT_SECRET = "test-secret-key";
process.env.NODE_ENV = "test";
