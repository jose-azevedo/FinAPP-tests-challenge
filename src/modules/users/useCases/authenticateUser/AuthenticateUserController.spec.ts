import request from 'supertest';
import { Connection } from "typeorm";
import { app } from '../../../../app';
import createConnection from '../../../../database/index';

let connection: Connection

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('Should be able to authenticate user', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'José',
        email: 'jose@email.com',
        password: '1234'
      });

    const { body: response } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jose@email.com',
        password: '1234'
      });

      expect(response).toHaveProperty('token')
      expect(response).toHaveProperty('user')
      expect(response.user.email).toBe('jose@email.com')
  });

  it('Should not be able to authenticate user with wrong password', async () => {
    const { body: response, status } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jose@email.com',
        password: '0000'
      });

      expect(status).toBe(401);
      expect(response.message).toBe('Incorrect email or password')
  })
})
