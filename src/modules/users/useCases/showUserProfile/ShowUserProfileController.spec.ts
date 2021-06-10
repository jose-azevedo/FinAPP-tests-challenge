import { Connection } from "typeorm"
import request from 'supertest';
import { app } from "../../../../app";
import createConnection from '../../../../database/index';

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to show user profile', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'José',
        email: 'jose@email.com',
        password: '1234'
      });

    const { body: tokenBody } = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'jose@email.com',
      password: '1234'
    });

    const token = tokenBody.token;

    const { body: profile, status } = await request(app)
    .get('/api/v1/profile')
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(status).toBe(200);
    expect(profile.name).toBe('José');
    expect(profile.email).toBe('jose@email.com');
  })

});
