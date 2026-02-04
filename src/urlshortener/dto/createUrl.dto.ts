import { IsString, IsNotEmpty, IsUrl } from "class-validator";
export class CreateUrlDto {
  @IsNotEmpty({ message: "Payload is not empty." })
  @IsString({ message: "Must be a string" })
  @IsUrl({}, { message: "Must be a valid URL" })
  payload: string;
}