import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
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

describe('Get Statement Operation Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
    createStatement = new CreateStatementUseCase(usersRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it('Should be able to get statement operation of a user', async () => {
    const { id: user_id }  = await createUserUseCase.execute(sampleUser);

    sampleStatement1.user_id = user_id as string;
    sampleStatement2.user_id = user_id as string;

    await createStatement.execute(sampleStatement1);
    const { id: statement_id} = await createStatement.execute(sampleStatement2);

    const statement = await getStatementOperationUseCase.execute({
      user_id: user_id as string,
      statement_id: statement_id as string
    });

    expect(statement.amount).toBe(70);
    expect(statement.type).toBe('withdraw');
  });

  it('Should not be able to get nonexistent statement operation', async () => {
    const { id: user_id }  = await createUserUseCase.execute(sampleUser);

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user_id as string,
        statement_id: 'nonexistent_statement_id'
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })

  it('Should not be able to get statement operation of nonexistent user', () => {
    expect(async () => {
      const { id: user_id }  = await createUserUseCase.execute(sampleUser);

      sampleStatement1.user_id = user_id as string;
      const { id: statement_id} = await createStatement.execute(sampleStatement1);

      await getStatementOperationUseCase.execute({
        user_id: 'nonexistent_user_id',
        statement_id: statement_id as string
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })
})
