import request from 'supertest';
import getConnection from '../../../../database/index';
import { app } from '../../../../app';
import { Connection } from 'typeorm';
import { sign } from 'jsonwebtoken';
import auth from '../../../../config/auth';
import { v4 as uuidv4 } from 'uuid';

let connection: Connection;
let token: string;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await getConnection();
    await connection.runMigrations();

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'José',
        email: 'jose@mail.com',
        password: '1234'
      })

    const { body } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jose@mail.com',
        password: '1234'
      })

    token = body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('Should be able to create new statement', async () => {
    const { body: statement, status } = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Internet'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(status).toBe(201);
    expect(statement.amount).toBe(100);
    expect(statement.description).toBe('Internet');
  });

  it('Should not be able to withdraw more than current balance', async () => {
    const { body: response, status } = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 150,
        description: 'Supermercado'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(status).toBe(400);
    expect(response.message).toBe('Insufficient funds');
  });

  it('Should not be able to create statement to a nonexistent user', async () => {
    const nonexistent_user_id = uuidv4();
    const nonexistent_user_token = sign({}, auth.jwt.secret, {
      subject: nonexistent_user_id,
      expiresIn: auth.jwt.expiresIn
    });

    const { body: response, status } = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Salary'
      })
      .set({
        Authorization: `Bearer ${nonexistent_user_token}`
      });

    // expect(status).toBe(404);
    expect(response.message).toBe('User not found');
  });
});
