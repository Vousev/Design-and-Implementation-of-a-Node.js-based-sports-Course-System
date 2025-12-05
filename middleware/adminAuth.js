const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// 管理员身份验证中间件
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '访问被拒绝，需要管理员令牌'
            });
        }

        // 验证JWT令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 检查令牌类型
        if (decoded.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '访问被拒绝，需要管理员权限'
            });
        }

        // 验证管理员是否存在且状态正常
        const admins = await query(
            'SELECT * FROM admin_users WHERE id = ? AND status = "active"',
            [decoded.id]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: '管理员账号不存在或已被禁用'
            });
        }

        // 将管理员信息添加到请求对象
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            permissions: decoded.permissions || []
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '无效的令牌'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '令牌已过期'
            });
        }

        console.error('管理员认证错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 权限检查中间件
const requirePermission = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            const { role, permissions } = req.user;

            // 超级管理员拥有所有权限
            if (role === 'super_admin') {
                return next();
            }

            // 检查是否有"all"权限
            if (permissions.includes('all')) {
                return next();
            }

            // 检查是否有所需的权限
            const hasPermission = requiredPermissions.some(permission => 
                permissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: '权限不足，无法执行此操作',
                    required_permissions: requiredPermissions,
                    user_permissions: permissions
                });
            }

            next();
        } catch (error) {
            console.error('权限检查错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    };
};

// 角色检查中间件
const requireRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            const { role } = req.user;

            if (!requiredRoles.includes(role)) {
                return res.status(403).json({
                    success: false,
                    message: '角色权限不足',
                    required_roles: requiredRoles,
                    user_role: role
                });
            }

            next();
        } catch (error) {
            console.error('角色检查错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    };
};

// 操作日志记录中间件
const logOperation = (operationType, operationModule) => {
    return async (req, res, next) => {
        // 保存原始的res.json方法
        const originalJson = res.json;

        // 重写res.json方法以记录操作结果
        res.json = function(data) {
            // 异步记录操作日志
            setImmediate(async () => {
                try {
                    const result = data.success ? 'success' : 'failure';
                    const description = `${operationType} - ${req.method} ${req.originalUrl}`;
                    
                    await query(
                        `INSERT INTO admin_operation_logs 
                         (admin_id, operation_type, operation_module, operation_description, ip_address, user_agent, result) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            req.user?.id || null,
                            operationType,
                            operationModule,
                            description,
                            req.ip || req.connection.remoteAddress,
                            req.get('User-Agent') || '',
                            result
                        ]
                    );
                } catch (error) {
                    console.error('记录操作日志失败:', error);
                }
            });

            // 调用原始的json方法
            return originalJson.call(this, data);
        };

        next();
    };
};

// IP白名单检查中间件
const checkIPWhitelist = (req, res, next) => {
    // 获取客户端IP
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // 从环境变量或配置中获取IP白名单
    const whitelist = process.env.ADMIN_IP_WHITELIST?.split(',') || [];
    
    // 如果没有配置白名单，则跳过检查
    if (whitelist.length === 0) {
        return next();
    }

    // 检查IP是否在白名单中
    const isAllowed = whitelist.some(ip => {
        // 支持CIDR格式的IP段
        if (ip.includes('/')) {
            // 这里可以添加CIDR匹配逻辑
            return false;
        }
        return clientIP === ip.trim();
    });

    if (!isAllowed) {
        return res.status(403).json({
            success: false,
            message: 'IP地址不在允许列表中',
            client_ip: clientIP
        });
    }

    next();
};

// 速率限制中间件
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.user?.id || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // 清理过期的请求记录
        if (requests.has(key)) {
            const userRequests = requests.get(key).filter(time => time > windowStart);
            requests.set(key, userRequests);
        }

        // 获取当前窗口内的请求数
        const currentRequests = requests.get(key) || [];
        
        if (currentRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: '请求过于频繁，请稍后再试',
                retry_after: Math.ceil(windowMs / 1000)
            });
        }

        // 记录当前请求
        currentRequests.push(now);
        requests.set(key, currentRequests);

        next();
    };
};

// 维护模式检查中间件
const checkMaintenanceMode = async (req, res, next) => {
    try {
        // 检查系统是否处于维护模式
        const config = await query(
            'SELECT config_value FROM system_config WHERE config_key = "system_maintenance_mode"'
        );

        if (config.length > 0 && config[0].config_value === 'true') {
            // 超级管理员可以在维护模式下访问
            if (req.user?.role === 'super_admin') {
                return next();
            }

            // 获取维护消息
            const messageConfig = await query(
                'SELECT config_value FROM system_config WHERE config_key = "maintenance_message"'
            );

            return res.status(503).json({
                success: false,
                message: '系统正在维护中',
                maintenance_message: messageConfig[0]?.config_value || '系统维护中，请稍后访问'
            });
        }

        next();
    } catch (error) {
        console.error('检查维护模式错误:', error);
        next(); // 出错时继续执行，避免影响正常功能
    }
};

module.exports = {
    authenticateAdmin,
    requirePermission,
    requireRole,
    logOperation,
    checkIPWhitelist,
    rateLimit,
    checkMaintenanceMode
};
