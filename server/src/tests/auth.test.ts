import request from 'supertest';
import app from '../app';
import { connectTestDb, closeTestDb, clearTestDb } from './db';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('🔐 Auth Module Integration Tests', () => {
  const mockUser = {
    name: 'Admin User',
    email: 'admin@leadflowcrm.com',
    password: 'password123',
    role: 'ADMIN',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(mockUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.email).toBe(mockUser.email.toLowerCase());
  });

  it('should fail to register if email already exists', async () => {
    await request(app).post('/api/auth/register').send(mockUser);
    const res = await request(app).post('/api/auth/register').send(mockUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('should authenticate user and return access token + cookie refresh token', async () => {
    // Register
    await request(app).post('/api/auth/register').send(mockUser);

    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe(mockUser.email);
    
    // Cookie checks
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('refreshToken');
  });

  it('should refresh access token using refresh cookie', async () => {
    await request(app).post('/api/auth/register').send(mockUser);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: mockUser.email,
      password: mockUser.password,
    });

    const refreshCookie = loginRes.headers['set-cookie'][0].split(';')[0];

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [refreshCookie]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data).toHaveProperty('accessToken');
  });

  it('should reject access to protected routes without a valid access token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
