import sql from 'mssql';
try {
  await sql.connect({
    server: 'localhost',
    database: 'AMS_DB',
    user: 'sa',
    password: 'Admin@123',
    options: { trustServerCertificate: true, encrypt: false }
  });
  console.log('✅ DB Connected');
} catch(e) {
  console.error('❌ Failed:', e.message);
}