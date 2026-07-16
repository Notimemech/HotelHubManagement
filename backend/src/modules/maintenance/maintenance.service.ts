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

  reportIssue(reporterId: number, dto: ReportIssueDto): Promise<IssueReport> {
    return this.issueRepo.save(
      this.issueRepo.create({
        ...dto,
        ReporterId: reporterId,
        Status: 'Pending',
      }),
    );
  }

  listIssues(): Promise<IssueReport[]> {
    return this.issueRepo.find({
      relations: { room: true, reporter: true },
      order: { CreatedAt: 'DESC' },
    });
  }

  async proveIssue(
    maintainerId: number,
    issueId: number,
    dto: ProveIssueDto,
  ): Promise<MaintenanceProve> {
    return this.dataSource.transaction(async (manager) => {
      const prove = await manager.save(
        manager.create(MaintenanceProve, {
          ...dto,
          IssueId: issueId,
          MaintainerId: maintainerId,
        }),
      );
      await manager.update(
        IssueReport,
        { IssueId: issueId },
        { Status: 'Resolved' },
      );
      return prove;
    });
  }

  listProves(issueId: number): Promise<MaintenanceProve[]> {
    return this.proveRepo.find({
      where: { IssueId: issueId },
      relations: { maintainer: true },
    });
  }
}
