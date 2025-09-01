/**
 * Schema change detection script
 * 
 * This script compares the current database schema with a schema snapshot
 * and helps generate migrations for any detected changes
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const SCHEMA_SNAPSHOT_PATH = path.join(__dirname, '..', 'schema-snapshot.json');

// Query to get table structure
const getTablesQuery = `
  SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public'
  ORDER BY 
    table_name, ordinal_position;
`;

// Query to get indexes
const getIndexesQuery = `
  SELECT
    tablename,
    indexname,
    indexdef
  FROM
    pg_indexes
  WHERE
    schemaname = 'public'
  ORDER BY
    tablename, indexname;
`;

// Query to get constraints
const getConstraintsQuery = `
  SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM
    information_schema.table_constraints tc
  LEFT JOIN
    information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  LEFT JOIN
    information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
  WHERE
    tc.constraint_schema = 'public'
  ORDER BY
    tc.table_name, tc.constraint_name;
`;

// Get current schema
async function getCurrentSchema() {
  const client = await pool.connect();
  try {
    const tablesResult = await client.query(getTablesQuery);
    const indexesResult = await client.query(getIndexesQuery);
    const constraintsResult = await client.query(getConstraintsQuery);

    return {
      tables: tablesResult.rows,
      indexes: indexesResult.rows,
      constraints: constraintsResult.rows,
      timestamp: new Date().toISOString()
    };
  } finally {
    client.release();
  }
}

// Load previous schema snapshot if it exists
function getPreviousSchema() {
  if (fs.existsSync(SCHEMA_SNAPSHOT_PATH)) {
    const data = fs.readFileSync(SCHEMA_SNAPSHOT_PATH, 'utf8');
    return JSON.parse(data);
  }
  return null;
}

// Save current schema as snapshot
function saveSchemaSnapshot(schema) {
  fs.writeFileSync(SCHEMA_SNAPSHOT_PATH, JSON.stringify(schema, null, 2));
  console.log('Schema snapshot saved to', SCHEMA_SNAPSHOT_PATH);
}

// Compare schemas and detect changes
function detectChanges(currentSchema, previousSchema) {
  if (!previousSchema) {
    console.log('No previous schema snapshot found. Creating initial snapshot.');
    return { hasChanges: false, changes: [] };
  }

  const changes = [];

  // Compare tables and columns
  const currentTables = new Map();
  currentSchema.tables.forEach(table => {
    const key = `${table.table_name}.${table.column_name}`;
    currentTables.set(key, table);
  });

  const previousTables = new Map();
  previousSchema.tables.forEach(table => {
    const key = `${table.table_name}.${table.column_name}`;
    previousTables.set(key, table);
  });

  // Find added or modified columns
  for (const [key, table] of currentTables.entries()) {
    if (!previousTables.has(key)) {
      changes.push(`Added column: ${key}`);
    } else {
      const prevTable = previousTables.get(key);
      if (
        table.data_type !== prevTable.data_type ||
        table.is_nullable !== prevTable.is_nullable ||
        table.column_default !== prevTable.column_default
      ) {
        changes.push(`Modified column: ${key}`);
      }
    }
  }

  // Find removed columns
  for (const [key] of previousTables.entries()) {
    if (!currentTables.has(key)) {
      changes.push(`Removed column: ${key}`);
    }
  }

  // Compare indexes
  const currentIndexes = new Map();
  currentSchema.indexes.forEach(index => {
    const key = `${index.tablename}.${index.indexname}`;
    currentIndexes.set(key, index);
  });

  const previousIndexes = new Map();
  previousSchema.indexes.forEach(index => {
    const key = `${index.tablename}.${index.indexname}`;
    previousIndexes.set(key, index);
  });

  // Find added or modified indexes
  for (const [key, index] of currentIndexes.entries()) {
    if (!previousIndexes.has(key)) {
      changes.push(`Added index: ${key}`);
    } else {
      const prevIndex = previousIndexes.get(key);
      if (index.indexdef !== prevIndex.indexdef) {
        changes.push(`Modified index: ${key}`);
      }
    }
  }

  // Find removed indexes
  for (const [key] of previousIndexes.entries()) {
    if (!currentIndexes.has(key)) {
      changes.push(`Removed index: ${key}`);
    }
  }

  return {
    hasChanges: changes.length > 0,
    changes
  };
}

// Generate migration content based on detected changes
function generateMigrationContent(changes) {
  // This is a simplified example - in a real implementation,
  // you would generate actual migration code based on the changes
  return `/* Auto-generated migration based on schema changes */

exports.up = pgm => {
  // TODO: Implement the changes based on detected schema differences
  // Detected changes:
${changes.map(change => `  // - ${change}`).join('\n')}
};

exports.down = pgm => {
  // TODO: Implement the rollback logic
};
`;
}

// Main function
async function main() {
  try {
    console.log('Detecting schema changes...');
    
    const currentSchema = await getCurrentSchema();
    const previousSchema = getPreviousSchema();
    
    const { hasChanges, changes } = detectChanges(currentSchema, previousSchema);
    
    if (hasChanges) {
      console.log('Schema changes detected:');
      changes.forEach(change => console.log(`- ${change}`));
      
      // Generate migration content
      const migrationContent = generateMigrationContent(changes);
      console.log('\nGenerated migration content:');
      console.log(migrationContent);
      
      // In a real implementation, you might want to:
      // 1. Create a new migration file with this content
      // 2. Apply the migration
    } else {
      console.log('No schema changes detected.');
    }
    
    // Save current schema as the new snapshot
    saveSchemaSnapshot(currentSchema);
    
    console.log('Schema change detection completed.');
  } catch (error) {
    console.error('Error detecting schema changes:', error);
  } finally {
    await pool.end();
  }
}

// Run the script if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  detectChanges,
  getCurrentSchema,
  generateMigrationContent
};
