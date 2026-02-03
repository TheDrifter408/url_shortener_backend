import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { extractRefreshJwtFromCookie } from "./jwt.extractor";
import { Request } from "express";
import { JwtPayload, RequestUser } from "../types/JwtPayload";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractRefreshJwtFromCookie
      ]),
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET") || "",
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<RequestUser> {
    const refreshToken = req.cookies.refresh_token;

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        hashed_refresh_token: true,
      }
    });
    if (!user || !user.hashed_refresh_token) {
      throw new UnauthorizedException("Refresh token revoked or user not found");
    }
    const rtMatches = await bcrypt.compare(
      refreshToken,
      user.hashed_refresh_token,
    )
    if (!rtMatches) {
      throw new UnauthorizedException("Refresh Token mismatch")
    }
    return {
      id: user.id,
      email: user.email,
    }
  }

}