import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { extractRefreshJwtFromCookie } from "./jwt.extractor";
import { Request } from "express";
import { JwtPayload, RequestUser } from "../types/JwtPayload";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>("JWT_REFRESH_SECRET");
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractRefreshJwtFromCookie
      ]),
      secretOrKey: secret || "",
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<RequestUser> {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token revoked or missing");
    }

    return {
      id: payload.sub,
      email: payload.email,
      refreshToken,
    }
  }

}