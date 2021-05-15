import { NextApiResponse } from "next";

export class StatusError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function handleStatusError(res: NextApiResponse, err: Error) {
  if (err instanceof StatusError) {
    const statusErr: StatusError = err;
    res.status(statusErr.status).json({
      message: statusErr.message,
    });
  } else {
    res.status(500).json({
      message: "internal server error",
    });
  }
}
