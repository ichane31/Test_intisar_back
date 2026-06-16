import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

const e2e = process.env.DATABASE_URL ? describe : describe.skip;

e2e('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /health', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });

  it('POST /api/auth/login rejects bad password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@intisar.com', password: 'wrong' })
      .expect(401);
  });

  it('POST /api/auth/login returns token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@intisar.com', password: 'admin123' })
      .expect((r) => {
        expect([200, 201]).toContain(r.status);
      });
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user?.email).toBe('admin@intisar.com');
  });

  it('GET /api/auth/me includes permissions', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@intisar.com', password: 'admin123' });
    const token = login.body.accessToken as string;
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body.user?.permissions)).toBe(true);
    expect(res.body.user.permissions).toContain('manage_settings');
  });

  it('GET /api/omra-packs returns paginated shape', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@intisar.com', password: 'admin123' });
    const token = login.body.accessToken as string;
    const res = await request(app.getHttpServer())
      .get('/api/omra-packs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta?.total).toBeDefined();
  });

  it('PATCH lead rejects invalid status transition', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@intisar.com', password: 'admin123' });
    const token = login.body.accessToken as string;
    const created = await request(app.getHttpServer())
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'E2E',
        lastName: 'Test',
        email: `e2e-${Date.now()}@test.local`,
        source: 'website',
        interest: 'omra',
        status: 'new',
      })
      .expect((r) => {
        expect([200, 201]).toContain(r.status);
      });
    const id = created.body.id as string;
    await request(app.getHttpServer())
      .patch(`/api/leads/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'converted' })
      .expect(400);
  });

  it('ADMIN cannot POST /api/admin-users', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'manager@intisar.com', password: 'manager123' });
    const token = login.body.accessToken as string;
    await request(app.getHttpServer())
      .post('/api/admin-users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'newuser@test.local',
        password: 'password123',
        name: 'X',
        role: 'ADMIN',
      })
      .expect(403);
  });
});
