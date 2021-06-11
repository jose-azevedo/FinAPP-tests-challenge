import request from 'supertest';
import getConnection from '../../../../database/index';
import { app } from '../../../../app';
import { Connection } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

let connection: Connection;
let token: string;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await getConnection();
    await connection.runMigrations();

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'José',
        email: 'jose@mail.com',
        password: '1234'
      });

    const { body } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jose@mail.com',
        password: '1234'
      });

    token = body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to get statement operation', async () => {
    const { body: statement } = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Lanche'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const { body: receivedStatement } = await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(receivedStatement.amount).toBe('100.00');
    expect(receivedStatement.description).toBe('Lanche');
    expect(receivedStatement.type).toBe('deposit');
  });

  it('Should not be able to get nonexistent statement operation', async () => {
    const nonexistent_id = uuidv4();
    const { body: response } = await request(app)
      .get(`/api/v1/statements/${nonexistent_id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.message).toBe('Statement not found');
  });
});
