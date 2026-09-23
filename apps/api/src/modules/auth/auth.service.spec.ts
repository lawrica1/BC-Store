import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let findUnique: jest.Mock;
  let create: jest.Mock;

  beforeEach(async () => {
    findUnique = jest.fn().mockResolvedValue(null);
    create = jest.fn((args) => ({ id: "user-1", ...args.data }));

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: { user: { findUnique, create, findMany: jest.fn() } } },
        { provide: JwtService, useValue: { sign: jest.fn(() => "signed-token") } }
      ]
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe("register", () => {
    const dto = { email: "Client@Example.com", password: "s3cret-pass", name: " Ada " };

    it("creates a CUSTOMER, normalises the email and hashes the password", async () => {
      const session = await service.register(dto);
      const data = create.mock.calls[0][0].data;

      expect(data.role).toBe("CUSTOMER");
      expect(data.email).toBe("client@example.com");
      expect(data.name).toBe("Ada");
      expect(data.password).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, data.password)).toBe(true);
      expect(session.accessToken).toBe("signed-token");
      expect(session.user.role).toBe("CUSTOMER");
    });

    it("rejects an email that is already registered", async () => {
      findUnique.mockResolvedValueOnce({ id: "existing" });
      await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("rejects an unknown user", async () => {
      await expect(service.login("nobody@example.com", "whatever")).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("rejects a wrong password", async () => {
      findUnique.mockResolvedValueOnce({ id: "u", email: "a@b.c", name: "A", role: "CUSTOMER", password: await bcrypt.hash("right", 4) });
      await expect(service.login("a@b.c", "wrong")).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("returns a session for valid credentials", async () => {
      findUnique.mockResolvedValueOnce({ id: "u", email: "a@b.c", name: "A", role: "CUSTOMER", password: await bcrypt.hash("right", 4) });
      const session = await service.login("a@b.c", "right");
      expect(session.user.id).toBe("u");
    });
  });
});
