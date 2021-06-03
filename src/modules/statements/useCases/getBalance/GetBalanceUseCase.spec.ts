import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createStatement: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

const sampleUser = {
  name: 'José',
  email: 'jose@email.com',
  password: '1234'
} as ICreateUserDTO;

const sampleStatement1 = {
  user_id: '',
  amount: 100,
  description: 'Ignite',
  type: 'deposit'
} as ICreateStatementDTO;

const sampleStatement2 = {
  user_id: '',
  amount: 70,
  description: 'Lanche',
  type: 'withdraw'
} as ICreateStatementDTO;

describe('Get Balance Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
    createStatement = new CreateStatementUseCase(usersRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it('Should be able to get balance of a user', async () => {
    const { id }  = await createUserUseCase.execute(sampleUser);

    sampleStatement1.user_id = id as string;
    sampleStatement2.user_id = id as string;

    await createStatement.execute(sampleStatement1);
    await createStatement.execute(sampleStatement2);

    const balance = await getBalanceUseCase.execute({user_id: id as string});

    expect(balance.statement.length).toBe(2);
    expect(balance.balance).toBe(30);
  });

  it('Should not be able to get balance of nonexistent user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'nonexistent_user_id' });
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
})
