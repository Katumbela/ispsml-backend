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
    }

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
            // Find all courses in the department
            const courses = await prisma.course.findMany({
                where: { departmentId: Number(id) },
                include: { years: { include: { semesters: true } } }
            });

            // Delete all related entities in the correct order (from deepest to shallowest)
            for (const course of courses) {
                for (const year of course.years) {
                    for (const semester of year.semesters) {
                        // Delete subjects for each semester
                        await prisma.subject.deleteMany({
                            where: { semesterId: semester.id }
                        });
                    }
                    // Delete semesters for each year
                    await prisma.semester.deleteMany({
                        where: { yearId: year.id }
                    });
                }
                // Delete years for each course
                await prisma.year.deleteMany({
                    where: { courseId: course.id }
                });
                // Delete shift for the course
                await prisma.shift.deleteMany({
                    where: { courseId: course.id }
                });
            }

            // Delete all courses in the department
            await prisma.course.deleteMany({
                where: { departmentId: Number(id) }
            });

            // Delete department director
            await prisma.departmentDirector.deleteMany({
                where: { departmentId: Number(id) }
            });

            // Finally delete the department itself
            return prisma.department.delete({
                where: { id: Number(id) }
            });
        });
    }
}