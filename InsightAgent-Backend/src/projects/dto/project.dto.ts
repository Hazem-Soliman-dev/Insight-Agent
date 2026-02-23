import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;
}
