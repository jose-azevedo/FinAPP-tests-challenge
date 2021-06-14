import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { MakeTransferUseCase } from './MakeTransferUseCase';

class MakeTransferController {
	async handle (request: Request, response: Response): Promise<Response> {
		const { id: sender_id } = request.user;
		const { recipient_id } = request.params;
		const { amount, description } = request.body;

		const makeTransferUseCase = container.resolve(MakeTransferUseCase);

		const transferStatements = await makeTransferUseCase.execute({
			sender_id,
			recipient_id,
			amount,
			description
		});

		return response.status(201).json(transferStatements);
	}
}

export { MakeTransferController };
