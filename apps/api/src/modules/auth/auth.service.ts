import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { RegisterDto } from "./dto/register.dto";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.session(user);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException("An account with this email already exists.");
    }

    // Self-service sign-up can only ever create customers; staff accounts are seeded.
    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        phone: dto.phone?.trim() || null,
        password: await bcrypt.hash(dto.password, 10),
        role: Role.CUSTOMER
      }
    });

    return this.session(user);
  }

  listTechnicians() {
    return this.prisma.user.findMany({
      where: { role: Role.TECHNICIAN },
      select: { id: true, name: true }
    });
  }

  private session(user: SessionUser) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }
}
