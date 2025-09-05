#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Security patterns to check for
const SENSITIVE_PATTERNS = [
  // Passwords and credentials
  /password\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  /passwd\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  /pwd\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  
  // API keys and tokens
  /api[_-]?key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  /token\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  
  // Email addresses
  /email\s*[:=]\s*['"`][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}['"`]/gi,
  
  // Phone numbers
  /phone\s*[:=]\s*['"`][0-9\s\-\+\(\)]+['"`]/gi,
  /tel\s*[:=]\s*['"`][0-9\s\-\+\(\)]+['"`]/gi,
  
  // URLs with credentials
  /https?:\/\/[^\/]+:[^@]+@[^\s]+/gi,
  
  // Database connection strings
  /mongodb:\/\/[^\/]+:[^@]+@[^\s]+/gi,
  /postgresql:\/\/[^\/]+:[^@]+@[^\s]+/gi,
  /mysql:\/\/[^\/]+:[^@]+@[^\s]+/gi,
  
  // Hardcoded credentials
  /admin\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  /root\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  /user\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  /username\s*[:=]\s*['"`][^'"`]+['"`]/gi,
];

// File extensions to scan
const SCAN_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.json', '.env', '.config.js', '.config.ts'
];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules', '.git', '.next', 'dist', 'build', 'coverage'
];

// Files to exclude
const EXCLUDE_FILES = [
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'
];

function shouldScanFile(filePath) {
  const ext = path.extname(filePath);
  const fileName = path.basename(filePath);
  
  if (!SCAN_EXTENSIONS.includes(ext)) return false;
  if (EXCLUDE_FILES.includes(fileName)) return false;
  
  return true;
}

function shouldScanDirectory(dirPath) {
  const dirName = path.basename(dirPath);
  return !EXCLUDE_DIRS.includes(dirName);
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    SENSITIVE_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Mask sensitive data in output
          const maskedMatch = match.replace(/(['"`])([^'"`]+)(['"`])/g, '$1***MASKED***$3');
          issues.push({
            pattern: pattern.toString(),
            match: maskedMatch,
            line: content.substring(0, content.indexOf(match)).split('\n').length
          });
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath, results = []) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (shouldScanDirectory(item)) {
          scanDirectory(fullPath, results);
        }
      } else if (stat.isFile()) {
        if (shouldScanFile(fullPath)) {
          const issues = scanFile(fullPath);
          if (issues.length > 0) {
            results.push({
              file: fullPath,
              issues: issues
            });
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
    return results;
  }
}

function generateReport(results) {
  console.log('\n🔒 SECURITY AUDIT REPORT');
  console.log('=' .repeat(50));
  
  if (results.length === 0) {
    console.log('✅ No security issues found!');
    return;
  }
  
  console.log(`⚠️  Found ${results.length} files with potential security issues:\n`);
  
  results.forEach((fileResult, index) => {
    console.log(`${index + 1}. ${fileResult.file}`);
    fileResult.issues.forEach((issue, issueIndex) => {
      console.log(`   ${issueIndex + 1}. Line ${issue.line}: ${issue.match}`);
    });
    console.log('');
  });
  
  console.log('🔧 RECOMMENDATIONS:');
  console.log('1. Review all flagged items above');
  console.log('2. Move sensitive data to environment variables');
  console.log('3. Use encryption for stored sensitive data');
  console.log('4. Implement proper access controls');
  console.log('5. Regular security audits');
}

function main() {
  const projectRoot = process.cwd();
  console.log('🔍 Starting security audit...');
  console.log(`📁 Scanning directory: ${projectRoot}`);
  
  const results = scanDirectory(projectRoot);
  generateReport(results);
  
  // Exit with error code if issues found
  if (results.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  scanDirectory,
  scanFile,
  SENSITIVE_PATTERNS
};
