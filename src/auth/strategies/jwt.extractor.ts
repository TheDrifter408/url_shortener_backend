import { Request } from "express";

export function extractJwtFromCookie(request: Request)  {
  if (request.cookies && request.cookies.access_token) {
    return request.cookies.access_token;
  }
  return null;
}

export function extractRefreshJwtFromCookie(request: Request) {
  if (request.cookies && request.cookies.refresh_token) {
    return request.cookies.refresh_token;
  }
  return null;
}