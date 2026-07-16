import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IssueReport } from './entities/issue-report.entity';
import { MaintenanceProve } from './entities/maintenance-prove.entity';
import { ReportIssueDto } from './dto/report-issue.dto';
import { ProveIssueDto } from './dto/prove-issue.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(IssueReport)
    private readonly issueRepo: Repository<IssueReport>,
    @InjectRepository(MaintenanceProve)
    private readonly proveRepo: Repository<MaintenanceProve>,
    private readonly dataSource: DataSource,
  ) {}

  reportIssue(reporterId: string, dto: ReportIssueDto): Promise<IssueReport> {
    return this.issueRepo.save(
      this.issueRepo.create({
        ...dto,
        reporterId: reporterId,
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

  async proveIssue(
    maintainerId: string,
    issueId: string,
    dto: ProveIssueDto,
  ): Promise<MaintenanceProve> {
    return this.dataSource.transaction(async (manager) => {
      const prove = await manager.save(
        manager.create(MaintenanceProve, {
          ...dto,
          issueId: issueId,
          maintainerId: maintainerId,
        }),
      );
      await manager.update(
        IssueReport,
        { issueId: issueId },
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
}
