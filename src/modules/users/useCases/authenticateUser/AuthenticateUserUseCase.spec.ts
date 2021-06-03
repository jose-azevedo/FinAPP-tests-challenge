import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    await createUserUseCase.execute({
      name: 'José',
      email: 'jose@email.com',
      password: '1234'
    });
  });

  it('Should be able to authenticate user', async () => {
    const userToken = await authenticateUserUseCase.execute({
      email: 'jose@email.com',
      password: '1234'
    });

    expect(userToken).toHaveProperty('token');
  });

  it('Should not be able to authenticate user when the wrong password is supplied', () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
      email: 'jose@email.com',
      password: '1233'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('Should not be able to authenticate nonexistent user', () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
      email: 'roberto@email.com',
      password: '1234'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
