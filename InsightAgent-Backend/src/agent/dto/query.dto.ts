import { IsString, IsNotEmpty } from 'class-validator';

export class QueryDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}
