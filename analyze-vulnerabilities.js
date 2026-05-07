#!/usr/bin/env node

/**
 * Script de análisis de vulnerabilidades específicas del proyecto
 * Genera un reporte en formato que SonarQube puede leer
 */

const fs = require('fs');
const path = require('path');

// Definir vulnerabilidades a detectar
const vulnerabilities = [
  {
    id: 'VULN-001',
    name: 'SQL Injection Pattern (== comparison)',
    severity: 'CRITICAL',
    pattern: /\.\w+\s*==\s*\w+/,
    files: ['server.js'],
    description: 'Comparación insegura usando =='
  },
  {
    id: 'VULN-002',
    name: 'Information Disclosure',
    severity: 'CRITICAL',
    pattern: /res\.json\(users\)/,
    files: ['server.js'],
    description: 'Endpoint expone datos sensibles sin autenticación'
  },
  {
    id: 'VULN-003',
    name: 'Cross-Site Scripting (XSS)',
    severity: 'HIGH',
    pattern: /\.innerHTML\s*=\s*\w+/,
    files: ['public/app.js'],
    description: 'Inserción de HTML sin sanitizar'
  },
  {
    id: 'VULN-004',
    name: 'Insecure Credential Transmission',
    severity: 'HIGH',
    pattern: /username.*password.*fetch|fetch.*username.*password/,
    files: ['public/app.js'],
    description: 'Credenciales en URL sin encriptación'
  },
  {
    id: 'VULN-005',
    name: 'Sensitive Data Logging',
    severity: 'MEDIUM',
    pattern: /logActivity\([^,]*,\s*\{.*password/,
    files: ['server.js'],
    description: 'Contraseñas registradas en logs'
  }
];

// Analizar archivos
const issues = [];

vulnerabilities.forEach(vuln => {
  vuln.files.forEach(file => {
    const filePath = path.join(__dirname, file);
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (vuln.pattern.test(line)) {
            issues.push({
              ruleId: vuln.id,
              level: 'error',
              message: `[${vuln.name}] ${vuln.description}`,
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: {
                      uri: file
                    },
                    region: {
                      startLine: index + 1
                    }
                  }
                }
              ]
            });
          }
        });
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  });
});

// Generar reporte SARIF para SonarQube
const sarifReport = {
  version: '2.1.0',
  runs: [
    {
      tool: {
        driver: {
          name: 'Custom Security Scanner',
          version: '1.0.0',
          informationUri: 'https://example.com',
          rules: vulnerabilities.map(v => ({
            id: v.id,
            shortDescription: {
              text: v.name
            },
            fullDescription: {
              text: v.description
            },
            help: {
              text: `Severity: ${v.severity}`
            },
            properties: {
              tags: ['security', 'vulnerability']
            }
          }))
        }
      },
      results: issues
    }
  ]
};

// Guardar reportes
const eslintReport = {
  issues: issues.map(i => ({
    ruleId: i.ruleId,
    message: i.message,
    severity: 'error',
    line: i.locations[0].physicalLocation.region.startLine,
    column: 0,
    filePath: i.locations[0].physicalLocation.artifactLocation.uri
  }))
};

try {
  fs.writeFileSync('security-report.sarif', JSON.stringify(sarifReport, null, 2));
  console.log('✓ Generated security-report.sarif');
  
  fs.writeFileSync('security-issues.json', JSON.stringify(eslintReport, null, 2));
  console.log('✓ Generated security-issues.json');
  
  console.log(`\n📊 Found ${issues.length} potential security issues`);
  issues.forEach(issue => {
    console.log(`  - ${issue.ruleId}: ${issue.locations[0].physicalLocation.artifactLocation.uri}:${issue.locations[0].physicalLocation.region.startLine}`);
  });
  
} catch (err) {
  console.error('Error writing reports:', err.message);
  process.exit(1);
}
