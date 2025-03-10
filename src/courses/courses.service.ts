/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CourseService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.course.findMany({
            include: {
                department: true,
                years: { include: { semesters: { include: { subjects: true } } } },
                shift: true,
            },
        });
    }

    async findById(id: number) {
        const course = await this.prisma.course.findUnique({
            where: { id: Number(id) },
            include: {
                department: true,
                years: { include: { semesters: { include: { subjects: true } } } },
                shift: true,
            },
        });
        if (!course) throw new NotFoundException('Curso não encontrado!');
        return course;
    }

    async findBySlug(slug: string) {
        const course = await this.prisma.course.findFirst({
            where: { slug },
            include: {
                department: true,
                years: { include: { semesters: { include: { subjects: true } } } },
                shift: true,
            },
        });
        if (!course) throw new NotFoundException('Curso não encontrado!');
        return course;
    }

    async create(createCourseDto: CreateCourseDto) {
        const { departmentId, ...courseData } = createCourseDto;
        return this.prisma.course.create({
            data: {
                ...courseData,
                benefits: courseData.benefits, // Add empty array as default value
                department: { connect: { id: Number(departmentId) } },
                shift: {
                    create: {
                        afternoon: createCourseDto.shift.afternoon,
                        evening: createCourseDto.shift.evening,
                        morning: createCourseDto.shift.morning,
                    }
                },
                years: {
                    create: createCourseDto.years.map((year) => ({
                        year: Number(year.year),
                        semesters: {
                            create: year.semesters.map((semester) => ({
                                semester: Number(semester.semester),
                                subjects: {
                                    create: semester.subjects.map((subject) => ({
                                        name: subject.name,
                                        workload: Number(subject.workload),
                                    })),
                                },
                            })),
                        },
                    })),
                },
            },
        });
    }

    async update(id: number, updateCourseDto: UpdateCourseDto) {
        return this.prisma.course.update({
            where: { id: Number(id) },
            data: updateCourseDto,
            include: {
                department: true,
                years: { include: { semesters: { include: { subjects: true } } } },
                shift: true,
            },
        });
    }

    async remove(id: number) {
        return this.prisma.$transaction(async (prisma) => {
            // Delete related entities in the correct order
            const course = await prisma.course.findUnique({
                where: { id: Number(id) },
                include: { years: { include: { semesters: true } }, shift: true },
            });

            for (const year of course.years) {
                for (const semester of year.semesters) {
                    await prisma.subject.deleteMany({
                        where: { semesterId: semester.id },
                    });
                }
                await prisma.semester.deleteMany({
                    where: { yearId: year.id },
                });
            }
            await prisma.year.deleteMany({
                where: { courseId: course.id },
            });
            await prisma.shift.deleteMany({
                where: { courseId: course.id },
            });

            return prisma.course.delete({
                where: { id: Number(id) },
            });
        });
    }
}
