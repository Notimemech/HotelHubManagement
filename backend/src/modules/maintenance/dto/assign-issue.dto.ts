import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignIssueDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  issueId!: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  maintainerStaffId!: string;
}
