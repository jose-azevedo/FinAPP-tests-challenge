import { inject, injectable } from 'tsyringe';

import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { Statement } from '../../entities/Statement';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { IMakeTransferDTO } from './IMakeTransferDTO';
import { MakeTransferError } from './MakeTransferError';

@injectable()
class MakeTransferUseCase {
	constructor (
		@inject('StatementsRepository')
		private statementsRepository: IStatementsRepository,
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}

	async execute ({ sender_id, recipient_id, amount, description }: IMakeTransferDTO): Promise<Statement[]> {
		const senderUser = await this.usersRepository.findById(sender_id);

		if (!senderUser) {
			throw new MakeTransferError.SenderNotFound();
		}

		const recipientUser = await this.usersRepository.findById(recipient_id);

		if (!recipientUser) {
			throw new MakeTransferError.RecipientNotFound();
		}

		const { balance: senderBalance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

		if (amount > senderBalance) {
			throw new MakeTransferError.InsufficientFunds();
		}

		return await this.statementsRepository.transfer({
			sender_id,
			recipient_id,
			amount,
			description
		});
	}
}

export { MakeTransferUseCase };
