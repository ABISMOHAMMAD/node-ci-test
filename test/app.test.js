const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
  it('responds with Hello, Jenkins + ArgoCD!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, Jenkins + ArgoCD!');
  });
});

