import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IssueReport } from './entities/issue-report.entity';
import { MaintenanceProve } from './entities/maintenance-prove.entity';
import { IssueAssignment } from './entities/issue-assignment.entity';
import { ReportIssueDto } from './dto/report-issue.dto';
import { ProveIssueDto } from './dto/prove-issue.dto';
import { StaffService } from '../staff/staff.service';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(IssueReport)
    private readonly issueRepo: Repository<IssueReport>,
    @InjectRepository(MaintenanceProve)
    private readonly proveRepo: Repository<MaintenanceProve>,
    @InjectRepository(IssueAssignment)
    private readonly assignmentRepo: Repository<IssueAssignment>,
    private readonly dataSource: DataSource,
    private readonly staffService: StaffService,
  ) {}

  async reportIssue(
    reporterAccountId: string,
    dto: ReportIssueDto,
  ): Promise<IssueReport> {
    const reporter = await this.staffService.findByAccountId(reporterAccountId);
    const reporterId = reporter ? reporter.staffId : reporterAccountId;

    return this.issueRepo.save(
      this.issueRepo.create({
        roomId: dto.roomId,
        reporterId,
        description: dto.description,
        issueImage: dto.issueImage,
        status: 'Pending',
      }),
    );
  }

  listIssues(): Promise<IssueReport[]> {
    return this.issueRepo.find({
      relations: { room: true, reporter: true },
      order: { createdAt: 'DESC' },
    });
  }

  async listMyIssues(accountId: string): Promise<IssueAssignment[]> {
    const staff = await this.staffService.findByAccountId(accountId);
    if (!staff) throw new ForbiddenException('Staff profile not found');

    return this.assignmentRepo.find({
      where: { maintainerId: staff.staffId },
      relations: { issue: { room: true } },
    });
  }

  async proveIssue(
    maintainerAccountId: string,
    issueId: string,
    dto: ProveIssueDto,
  ): Promise<MaintenanceProve> {
    const maintainer = await this.staffService.findByAccountId(
      maintainerAccountId,
    );
    if (!maintainer) throw new ForbiddenException('Staff profile not found');

    const assigned = await this.assignmentRepo.findOne({
      where: { issueId, maintainerId: maintainer.staffId },
    });
    if (!assigned) {
      throw new ForbiddenException('You are not assigned to this issue');
    }

    return this.dataSource.transaction(async (manager) => {
      const prove = await manager.save(
        manager.create(MaintenanceProve, {
          issueId,
          maintainerId: maintainer.staffId,
          finishImage: dto.finishImage,
          finishVideo: dto.finishVideo,
        }),
      );
      await manager.update(
        IssueReport,
        { issueId },
        { status: 'Resolved' },
      );
      return prove;
    });
  }

  listProves(issueId: string): Promise<MaintenanceProve[]> {
    return this.proveRepo.find({
      where: { issueId: issueId },
      relations: { maintainer: true },
    });
  }

  async assignIssue(
    managerAccountId: string,
    issueId: string,
    maintainerStaffId: string,
  ): Promise<IssueAssignment> {
    const manager = await this.staffService.findByAccountId(managerAccountId);
    if (!manager) throw new ForbiddenException('Manager profile not found');

    const issue = await this.issueRepo.findOne({ where: { issueId } });
    if (!issue) throw new NotFoundException('Issue not found');

    const existing = await this.assignmentRepo.findOne({
      where: { issueId, maintainerId: maintainerStaffId },
    });
    if (existing) return existing;

    return this.assignmentRepo.save(
      this.assignmentRepo.create({
        issueId,
        maintainerId: maintainerStaffId,
        assignedBy: manager.staffId,
      }),
    );
  }
}
