const mysql = require('mysql2/promise');
const config = require('../config/database');

/**
 * 数据完整性验证工具
 * 确保学生端、教师端、管理员端之间的数据关联正确
 */
class DataIntegrityValidator {
    constructor() {
        this.connection = null;
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    async init() {
        this.connection = await mysql.createConnection(config);
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
        }
    }

    // 验证用户表数据完整性
    async validateUserIntegrity() {
        console.log('🔍 验证用户表数据完整性...');
        
        try {
            // 检查学生数据
            const [studentUsers] = await this.connection.execute(`
                SELECT id, student_id, username, user_type, status 
                FROM users 
                WHERE user_type = 'student'
            `);
            this.info.push(`✅ 学生用户数量: ${studentUsers.length}`);

            // 检查教师数据关联
            const [teacherUsers] = await this.connection.execute(`
                SELECT u.id, u.username, u.teacher_id, u.user_type, t.name as teacher_name
                FROM users u
                LEFT JOIN teachers t ON u.teacher_id = t.id
                WHERE u.user_type = 'teacher'
            `);
            this.info.push(`✅ 教师用户数量: ${teacherUsers.length}`);

            // 检查孤立的教师用户（teacher_id为空或无效）
            const invalidTeachers = teacherUsers.filter(user => !user.teacher_name);
            if (invalidTeachers.length > 0) {
                this.warnings.push(`⚠️  发现${invalidTeachers.length}个教师用户没有关联到teachers表`);
            }

            // 检查管理员数据
            const [adminUsers] = await this.connection.execute(`
                SELECT COUNT(*) as count FROM admin_users WHERE status = 'active'
            `);
            this.info.push(`✅ 活跃管理员数量: ${adminUsers[0].count}`);

        } catch (error) {
            this.errors.push(`❌ 用户表验证失败: ${error.message}`);
        }
    }

    // 验证课程数据完整性
    async validateCourseIntegrity() {
        console.log('🔍 验证课程数据完整性...');
        
        try {
            // 检查课程与教师关联
            const [courseTeacherCheck] = await this.connection.execute(`
                SELECT c.id, c.name, c.teacher_id, t.name as teacher_name
                FROM courses c
                LEFT JOIN teachers t ON c.teacher_id = t.id
                WHERE c.status = 'published'
            `);
            
            const invalidCourseTeachers = courseTeacherCheck.filter(course => !course.teacher_name);
            if (invalidCourseTeachers.length > 0) {
                this.warnings.push(`⚠️  发现${invalidCourseTeachers.length}门课程没有有效的授课教师`);
            } else {
                this.info.push(`✅ 所有发布的课程都有有效的授课教师`);
            }

            // 检查课程与场地关联
            const [courseVenueCheck] = await this.connection.execute(`
                SELECT c.id, c.name, c.venue_id, v.name as venue_name
                FROM courses c
                LEFT JOIN venues v ON c.venue_id = v.id
                WHERE c.status = 'published'
            `);
            
            const invalidCourseVenues = courseVenueCheck.filter(course => !course.venue_name);
            if (invalidCourseVenues.length > 0) {
                this.warnings.push(`⚠️  发现${invalidCourseVenues.length}门课程没有有效的上课场地`);
            } else {
                this.info.push(`✅ 所有发布的课程都有有效的上课场地`);
            }

            // 检查选课记录完整性
            const [selectionIntegrity] = await this.connection.execute(`
                SELECT cs.id, cs.user_id, cs.course_id, u.real_name, c.name as course_name
                FROM course_selections cs
                LEFT JOIN users u ON cs.user_id = u.id
                LEFT JOIN courses c ON cs.course_id = c.id
                WHERE u.id IS NULL OR c.id IS NULL
            `);
            
            if (selectionIntegrity.length > 0) {
                this.errors.push(`❌ 发现${selectionIntegrity.length}条无效的选课记录（学生或课程已删除）`);
            } else {
                this.info.push(`✅ 所有选课记录的关联都有效`);
            }

        } catch (error) {
            this.errors.push(`❌ 课程数据验证失败: ${error.message}`);
        }
    }

    // 验证选课配置完整性
    async validateSelectionConfigIntegrity() {
        console.log('🔍 验证选课配置完整性...');
        
        try {
            // 检查是否存在有效的选课配置
            const [activeConfigs] = await this.connection.execute(`
                SELECT id, title, start_time, end_time, status
                FROM course_selection_config
                WHERE status = 'active'
                ORDER BY created_at DESC
            `);

            if (activeConfigs.length === 0) {
                this.warnings.push(`⚠️  没有找到活跃的选课配置，学生可能无法选课`);
            } else if (activeConfigs.length > 1) {
                this.warnings.push(`⚠️  发现${activeConfigs.length}个同时活跃的选课配置，可能导致冲突`);
            } else {
                this.info.push(`✅ 选课配置正常，当前活跃配置: ${activeConfigs[0].title}`);
            }

            // 检查时间重叠的配置
            const [overlappingConfigs] = await this.connection.execute(`
                SELECT c1.id as id1, c1.title as title1, c2.id as id2, c2.title as title2
                FROM course_selection_config c1, course_selection_config c2
                WHERE c1.id < c2.id 
                AND c1.status IN ('active', 'pending')
                AND c2.status IN ('active', 'pending')
                AND (
                    (c1.start_time <= c2.start_time AND c1.end_time > c2.start_time) OR
                    (c1.start_time < c2.end_time AND c1.end_time >= c2.end_time) OR
                    (c1.start_time >= c2.start_time AND c1.end_time <= c2.end_time)
                )
            `);

            if (overlappingConfigs.length > 0) {
                this.warnings.push(`⚠️  发现${overlappingConfigs.length}组时间重叠的选课配置`);
            }

        } catch (error) {
            this.errors.push(`❌ 选课配置验证失败: ${error.message}`);
        }
    }

    // 验证权限和角色完整性
    async validatePermissionIntegrity() {
        console.log('🔍 验证权限和角色完整性...');
        
        try {
            // 检查管理员权限
            const [adminRoles] = await this.connection.execute(`
                SELECT role, COUNT(*) as count
                FROM admin_users
                WHERE status = 'active'
                GROUP BY role
            `);

            this.info.push(`✅ 管理员角色分布:`);
            adminRoles.forEach(role => {
                this.info.push(`   - ${role.role}: ${role.count}人`);
            });

            // 检查是否至少有一个超级管理员
            const hasSuperAdmin = adminRoles.some(role => role.role === 'super_admin');
            if (!hasSuperAdmin) {
                this.errors.push(`❌ 系统中没有超级管理员，可能导致权限管理问题`);
            }

        } catch (error) {
            this.errors.push(`❌ 权限验证失败: ${error.message}`);
        }
    }

    // 验证数据统计信息
    async validateDataStatistics() {
        console.log('🔍 收集系统统计信息...');
        
        try {
            // 统计各类数据数量
            const [stats] = await this.connection.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM users WHERE user_type = 'student' AND status = 'active') as active_students,
                    (SELECT COUNT(*) FROM teachers WHERE status = 'active') as active_teachers,
                    (SELECT COUNT(*) FROM courses WHERE status = 'published') as published_courses,
                    (SELECT COUNT(*) FROM venues WHERE status = 'available') as available_venues,
                    (SELECT COUNT(*) FROM course_selections WHERE status IN ('selected', 'pending')) as total_selections,
                    (SELECT COUNT(*) FROM admin_operation_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as recent_logs
            `);

            const stat = stats[0];
            this.info.push(`📊 系统数据统计:`);
            this.info.push(`   - 活跃学生: ${stat.active_students}人`);
            this.info.push(`   - 活跃教师: ${stat.active_teachers}人`);
            this.info.push(`   - 发布课程: ${stat.published_courses}门`);
            this.info.push(`   - 可用场地: ${stat.available_venues}个`);
            this.info.push(`   - 选课记录: ${stat.total_selections}条`);
            this.info.push(`   - 近7天操作日志: ${stat.recent_logs}条`);

        } catch (error) {
            this.errors.push(`❌ 统计信息收集失败: ${error.message}`);
        }
    }

    // 执行完整性验证
    async validate() {
        console.log('🚀 开始数据完整性验证...\n');
        
        try {
            await this.init();
            
            await this.validateUserIntegrity();
            await this.validateCourseIntegrity();
            await this.validateSelectionConfigIntegrity();
            await this.validatePermissionIntegrity();
            await this.validateDataStatistics();

        } catch (error) {
            this.errors.push(`❌ 验证过程发生异常: ${error.message}`);
        } finally {
            await this.close();
        }

        // 输出验证结果
        this.printResults();
        
        return {
            success: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            info: this.info
        };
    }

    // 打印验证结果
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📋 数据完整性验证报告');
        console.log('='.repeat(50));

        if (this.info.length > 0) {
            console.log('\n✅ 信息:');
            this.info.forEach(msg => console.log(msg));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  警告:');
            this.warnings.forEach(msg => console.log(msg));
        }

        if (this.errors.length > 0) {
            console.log('\n❌ 错误:');
            this.errors.forEach(msg => console.log(msg));
        }

        console.log('\n' + '='.repeat(50));
        if (this.errors.length === 0) {
            console.log('🎉 验证通过！所有数据关联正常。');
        } else {
            console.log(`💥 验证失败！发现 ${this.errors.length} 个错误，${this.warnings.length} 个警告。`);
        }
        console.log('='.repeat(50) + '\n');
    }
}

// 如果直接运行此脚本，执行验证
if (require.main === module) {
    const validator = new DataIntegrityValidator();
    validator.validate().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('验证过程出错:', error);
        process.exit(1);
    });
}

module.exports = DataIntegrityValidator;
