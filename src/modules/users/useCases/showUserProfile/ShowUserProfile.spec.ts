import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);


  })

  it('Should be able to show user profile', async () => {
    const createdUser = await createUserUseCase.execute({
      name: 'José',
      email: 'jose@email.com',
      password: '1234'
    });

    const id = createdUser.id as string;

    const user = await showUserProfileUseCase.execute(id);

    expect(user).toHaveProperty('id');
    expect(user.name).toBe('José');
    expect(user.email).toBe('jose@email.com');
  })

  it('Should not be able to show profile of nonexistent user', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('nonexistent_id');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})
