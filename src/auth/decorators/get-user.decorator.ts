import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestUser } from "../types/JwtPayload";
import type { Request } from "express";

export const GetUser = createParamDecorator((data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();

  // Explicitly cast request.user as RequestUser;
  const user = request.user as RequestUser;

  if (data) {
    return user[data];
  }

  return user;

})