const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

describe('Auth & Health Endpoints', () => {
  it('GET /api/health returns healthy status and queue metrics', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('queues');
  });

  it('GET /api/prs returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/prs');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/search returns 401 when unauthenticated', async () => {
    const res = await request(app).post('/api/search').send({ query: 'test', repoFullName: 'org/repo' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/webhooks/health returns healthy', async () => {
    const res = await request(app).get('/api/webhooks/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
