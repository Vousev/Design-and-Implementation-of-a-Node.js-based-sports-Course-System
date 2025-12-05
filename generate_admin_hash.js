const bcrypt = require('bcryptjs');

async function generateAdminHash() {
    const adminPassword = 'admin123';
    const hash = await bcrypt.hash(adminPassword, 10);
    
    console.log('管理员密码哈希生成:');
    console.log('明文密码:', adminPassword);
    console.log('哈希值:', hash);
    
    // 验证
    const isValid = await bcrypt.compare(adminPassword, hash);
    console.log('验证结果:', isValid ? '✅ 正确' : '❌ 错误');
}

generateAdminHash().catch(console.error);
