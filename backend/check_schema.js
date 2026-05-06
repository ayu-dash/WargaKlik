require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkSchema() {
  try {
    const dialect = sequelize.getDialect();
    console.log('Dialect:', dialect);
    
    if (dialect === 'mysql') {
      const [results] = await sequelize.query("DESCRIBE laporan");
      console.log('Laporan schema:', JSON.stringify(results, null, 2));
      
      const statusField = results.find(f => f.Field === 'status');
      console.log('Status field:', statusField.Type);
      
      const jenisField = results.find(f => f.Field === 'jenis');
      console.log('Jenis field:', jenisField.Type);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
