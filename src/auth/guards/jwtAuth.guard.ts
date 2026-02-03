import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
// This triggers the 'jwt' strategy defined in passport strategies which extracts the token from the cookie

export class JwtAuthGuard extends AuthGuard('jwt') {
  // All extraction and validation is performed by the base class
}