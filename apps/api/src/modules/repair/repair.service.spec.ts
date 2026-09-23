import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { MailService } from "../notify/mail.service";
import { SmsService } from "../notify/sms.service";
import { RepairService } from "./repair.service";
import { RepairServiceType } from "./dto/create-repair-ticket.dto";

describe("RepairService", () => {
  let service: RepairService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RepairService,
        {
          provide: PrismaService,
          useValue: {
            repairTicket: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn()
            }
          }
        },
        {
          provide: NotificationsGateway,
          useValue: {
            emitTicketCreated: jest.fn(),
            emitTicketUpdated: jest.fn(),
            emitNewHomeVisit: jest.fn()
          }
        },
        { provide: MailService, useValue: { send: jest.fn() } },
        { provide: SmsService, useValue: { send: jest.fn() } }
      ]
    }).compile();

    service = moduleRef.get(RepairService);
  });

  it("rejects home fields for in-store tickets", async () => {
    await expect(
      service.create({
        deviceType: "TELEPHONE",
        brand: "Samsung",
        model: "A14",
        faultDesc: "Screen broken",
        serviceType: RepairServiceType.IN_STORE,
        homeAddress: "Bonamoussadi",
        visitDate: "2026-07-20T10:00:00.000Z",
        customerName: "Demo",
        customerPhone: "+237650000000"
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("requires home fields for at-home tickets", async () => {
    await expect(
      service.create({
        deviceType: "ORDINATEUR",
        brand: "HP",
        model: "EliteBook",
        faultDesc: "Battery does not charge",
        serviceType: RepairServiceType.AT_HOME,
        visitDate: "2026-07-20T10:00:00.000Z",
        customerName: "Demo",
        customerPhone: "+237650000000"
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
