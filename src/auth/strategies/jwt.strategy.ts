import { Strategy, ExtractJwt } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtPayload, RequestUser } from "../types/JwtPayload";
import { extractJwtFromCookie } from "./jwt.extractor";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService
  ) {

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET") || "",
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    // This returned object will become req.user
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}