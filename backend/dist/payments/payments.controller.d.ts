import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(req: any, dto: CreatePaymentDto): Promise<{
        message: string;
        PaymentId: number;
    }>;
    getHistory(req: any): Promise<import("./entities/payment.entity").Payment[]>;
}
