import { Connection } from "typeorm"
import request from 'supertest';
import { app } from "../../../../app";
import createConnection from '../../../../database/index';

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create new user', async () => {
    const { body, status } = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'José',
        email: 'jose@email.com',
        password: '1234'
      });

    expect(status).toBe(201);
  });
});
