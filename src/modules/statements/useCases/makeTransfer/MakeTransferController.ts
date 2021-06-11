import { Response } from "express";

class MakeTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.user;

    return response.send();
  }
}

export { MakeTransferController }
