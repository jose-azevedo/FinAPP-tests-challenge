import request from 'supertest';
import getConnection from '../../../../database/index';
import { app } from '../../../../app';
import { Connection } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import auth from '../../../../config/auth';
import { sign } from 'jsonwebtoken';

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

  it('Should be able to get user\'s balance', async () => {
    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 850,
        description: 'Salary'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

     await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 170,
        description: 'Internet'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const {body, status} = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(status).toBe(200);
    expect(body.balance).toBe(680);
    expect(body.statement.length).toBe(2);
  });

  it('Should not be able to get balance of nonexistent user', async () => {
    const nonexistent_user_id = uuidv4();
    const nonexistent_user_token = sign({}, auth.jwt.secret, {
      subject: nonexistent_user_id,
      expiresIn: auth.jwt.expiresIn
    });

    const {body, status} = await request(app)
    .get('/api/v1/statements/balance')
    .set({
      Authorization: `Bearer ${nonexistent_user_token}`
    });

    expect(status).toBe(404);
    expect(body.message).toBe('User not found');
  });
});
