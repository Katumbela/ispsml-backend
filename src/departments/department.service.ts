/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../common/services/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentService extends BaseService<UpdateDepartmentDto> {
    constructor(private readonly prisma: PrismaService,) {
        super(prisma, 'department');
    }

    async createDepartment(dto: CreateDepartmentDto) {
        return this.prisma.department.create({
            data: {
                name: dto.name,
                catalog_link: dto.catalog_link,
                slug: dto.slug,
                description: dto.description,
                department_cover: dto.department_cover,
                departmentDirector: {
                    create: {
                        name: dto.departmentDirector.name,
                        picture: dto.departmentDirector.picture,
                    },
                },
            },
            include: { departmentDirector: true, courses: true },
        });
    }


    async updateDep(id: number, dto: UpdateDepartmentDto) {
        return this.prisma.department.update({
            where: { id: Number(id) },
            data: {
                name: dto.name,
                catalog_link: dto.catalog_link,
                slug: dto.slug,
                description: dto.description,
                department_cover: dto.department_cover,
                departmentDirector: {
                    update: {
                        name: dto.departmentDirector.name,
                        picture: dto.departmentDirector.picture,
                    },
                },
            },
            include: { departmentDirector: true, courses: true },
        });
    }even

    async findCoursesByDepartmentId(departmentId: number) {
        return this.prisma.course.findMany({
            where: { departmentId: Number(departmentId) },
            include: { department: true, shift: true, years: { include: { semesters: { include: { subjects: true } } } }, },
        });
    }

    async findAllDeps() {
        return this.prisma.department.findMany({
            include: { courses: { include: { shift: true, years: { include: { semesters: { include: { subjects: true } } } }, } } },
        });
    }

    async deleteDepartment(id: number) {
        return this.prisma.$transaction(async (prisma) => {
            await prisma.course.deleteMany({
                where: { departmentId: id },
            });
            await prisma.departmentDirector.deleteMany({
                where: { departmentId: id },
            });
            return prisma.department.delete({
                where: { id },
            });
        });
    }
}