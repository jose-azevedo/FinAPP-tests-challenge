import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Create Statement Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('Should be able to create new statement', async () => {
    const user = await createUserUseCase.execute({
      name: 'José',
      email: 'jose@email.com',
      password: '1234'
    });

    const id = user.id as string;

    const statement = await createStatementUseCase.execute({
      user_id: id,
      amount: 100,
      description: 'Ignite',
      type: 'deposit' as OperationType,
    });

    expect(statement).toHaveProperty('id');
  });

  it('Should not be able to create statement of nonexistent user', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'nonexistent_user_id',
        amount: 100,
        description: 'Ignite',
        type: 'deposit' as OperationType,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it('Should not be able to withdraw more than what user currently have in balance', () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'José',
        email: 'jose@email.com',
        password: '1234'
      });

      const id = user.id as string;

      await createStatementUseCase.execute({
        user_id: id,
        amount: 100,
        description: 'Ignite',
        type: 'withdraw' as OperationType,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});
