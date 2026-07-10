require('dotenv').config();

console.log('ServicePro Sprint 36: installer console and white-label operations foundation loaded.');
console.log(`Installer console enabled: ${process.env.INSTALLER_CONSOLE_ENABLED || 'true'}`);
console.log(`Update channel: ${process.env.UPDATE_CHANNEL || 'stable'}`);
