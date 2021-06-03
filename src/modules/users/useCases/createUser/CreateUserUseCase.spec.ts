import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

const sampleUser1: ICreateUserDTO = {
  name: 'José',
  email: 'jose@email.com',
  password: '1234'
};

const sampleUser2: ICreateUserDTO = {
  name: 'Roberto',
  email: 'jose@email.com',
  password: '1234'
};

describe('Create User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('Should be able to create a new user',async () => {
    const user = await createUserUseCase.execute(sampleUser1);

    expect(user).toHaveProperty('id');
  });

  it('Should not be able to create more than one user with same email', () => {
    expect(async () => {
      await createUserUseCase.execute(sampleUser1);
      await createUserUseCase.execute(sampleUser2);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
})
