#!/usr/bin/env node

/**
 * Debug Test #9: Documentation Consistency Check
 * Tests if all documentation files reflect the new pricing model
 */

const fs = require('fs');
const path = require('path');

console.log('📚 DEBUG TEST #9: Documentation Consistency Check');
console.log('='.repeat(50));

const DOC_EXTENSIONS = ['.md', '.txt', '.rst'];
const EXPECTED_PRICE = '$9.99';
const OLD_PRICE = '$4.99';
const EXPECTED_MONTHLY = '9.99';
const OLD_MONTHLY = '4.99';

function findDocumentationFiles() {
  const docs = [];
  
  function scanDirectory(dir, maxDepth = 2, currentDepth = 0) {
    if (currentDepth > maxDepth || !fs.existsSync(dir)) return;
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      items.forEach(item => {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory() && currentDepth < maxDepth) {
          scanDirectory(fullPath, maxDepth, currentDepth + 1);
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();
          
          if (DOC_EXTENSIONS.includes(ext) || 
              item.name.toUpperCase().includes('README') ||
              item.name.includes('SETUP') ||
              item.name.includes('GUIDE') ||
              item.name.includes('PLAN')) {
            
            docs.push(fullPath);
          }
        }
      });
    } catch (error) {
      // Skip unreadable directories
    }
  }
  
  scanDirectory('.');
  return docs;
}

function analyzeDocumentationFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const analysis = {
      file: filePath,
      content,
      lines: lines.length,
      size: content.length,
      hasOldPrice: false,
      hasNewPrice: false,
      oldPriceReferences: [],
      newPriceReferences: [],
      revenueCalculations: [],
      businessMetrics: [],
      featureDescriptions: [],
      issues: []
    };

    // Check for old pricing
    if (content.includes(OLD_PRICE) || content.includes(OLD_MONTHLY)) {
      analysis.hasOldPrice = true;
      
      // Find specific lines with old pricing
      lines.forEach((line, index) => {
        if (line.includes(OLD_PRICE) || line.includes(OLD_MONTHLY)) {
          analysis.oldPriceReferences.push({
            line: index + 1,
            text: line.trim()
          });
        }
      });
    }

    // Check for new pricing
    if (content.includes(EXPECTED_PRICE) || content.includes(EXPECTED_MONTHLY)) {
      analysis.hasNewPrice = true;
      
      lines.forEach((line, index) => {
        if (line.includes(EXPECTED_PRICE) || line.includes(EXPECTED_MONTHLY)) {
          analysis.newPriceReferences.push({
            line: index + 1,
            text: line.trim()
          });
        }
      });
    }

    // Look for revenue calculations
    const revenuePatterns = [
      /revenue/gi,
      /\$\d+[,\d]*\s*(?:per|\/)\s*(?:month|year)/gi,
      /\d+\s*(?:users?|customers?)\s*[×x*]\s*\$\d+/gi,
      /ARR|MRR/gi
    ];

    revenuePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        analysis.revenueCalculations.push(...matches);
      }
    });

    // Look for business metrics
    const metricPatterns = [
      /\d+%\s*conversion/gi,
      /\d+\s*users?\s*(?:per|\/)\s*month/gi,
      /churn.*\d+%/gi,
      /retention.*\d+%/gi
    ];

    metricPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        analysis.businessMetrics.push(...matches);
      }
    });

    // Look for feature descriptions
    if (content.toLowerCase().includes('unlimited') || 
        content.toLowerCase().includes('invoice') ||
        content.toLowerCase().includes('free tier')) {
      
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        if ((lowerLine.includes('unlimited') || lowerLine.includes('free')) && 
            lowerLine.includes('invoice')) {
          analysis.featureDescriptions.push({
            line: index + 1,
            text: line.trim()
          });
        }
      });
    }

    // Check for old limitations
    if (content.includes('3 invoices') || content.includes('3-invoice')) {
      analysis.issues.push('Contains old 3-invoice limit');
    }

    // Check for consistency
    if (analysis.hasOldPrice && analysis.hasNewPrice) {
      analysis.issues.push('Contains both old and new pricing - inconsistent');
    }

    if (analysis.hasOldPrice && !analysis.hasNewPrice) {
      analysis.issues.push('Only contains old pricing - needs update');
    }

    return analysis;
  } catch (error) {
    return {
      file: filePath,
      error: error.message
    };
  }
}

function checkSpecificDocuments() {
  const criticalDocs = [
    'README.md',
    'BLUEPRINT.md',
    'FEATURES_COMPARISON.md',
    'PRICING.md',
    'BUSINESS_PLAN.md',
    'REVENUE_POTENTIAL.md',
    'LAUNCH_PLAN.md',
    'IMMEDIATE_LAUNCH_PLAN.md'
  ];

  const results = [];

  criticalDocs.forEach(doc => {
    if (fs.existsSync(doc)) {
      const analysis = analyzeDocumentationFile(doc);
      results.push({
        ...analysis,
        critical: true,
        found: true
      });
    } else {
      results.push({
        file: doc,
        critical: true,
        found: false
      });
    }
  });

  return results;
}

function validateBusinessCalculations(docs) {
  const calculations = [];
  
  docs.forEach(doc => {
    if (doc.revenueCalculations && doc.revenueCalculations.length > 0) {
      doc.revenueCalculations.forEach(calc => {
        // Try to extract numbers and validate calculations
        const numbers = calc.match(/\d+(?:\.\d+)?/g);
        if (numbers) {
          calculations.push({
            file: doc.file,
            calculation: calc,
            numbers: numbers.map(n => parseFloat(n)),
            usesOldPricing: calc.includes('4.99') || calc.includes('4'),
            usesNewPricing: calc.includes('9.99') || calc.includes('9')
          });
        }
      });
    }
  });

  return calculations;
}

function runDocumentationCheck() {
  console.log('🔍 Scanning for documentation files...\n');

  const allDocs = findDocumentationFiles();
  
  if (allDocs.length === 0) {
    console.log('⚠️  No documentation files found');
    return;
  }

  console.log(`✅ Found ${allDocs.length} documentation files`);

  // Analyze all documentation
  const analyses = allDocs.map(analyzeDocumentationFile).filter(a => !a.error);
  const errors = allDocs.map(analyzeDocumentationFile).filter(a => a.error);

  if (errors.length > 0) {
    console.log(`\n❌ Could not read ${errors.length} file(s):`);
    errors.forEach(err => console.log(`   ${err.file}: ${err.error}`));
  }

  // Summary statistics
  const stats = {
    total: analyses.length,
    withOldPricing: analyses.filter(a => a.hasOldPrice).length,
    withNewPricing: analyses.filter(a => a.hasNewPrice).length,
    withIssues: analyses.filter(a => a.issues.length > 0).length,
    withRevenue: analyses.filter(a => a.revenueCalculations.length > 0).length,
    withMetrics: analyses.filter(a => a.businessMetrics.length > 0).length
  };

  console.log(`\n📊 Documentation Analysis Summary:`);
  console.log(`   📄 Total documents analyzed: ${stats.total}`);
  console.log(`   ${stats.withOldPricing === 0 ? '✅' : '❌'} Documents with old pricing: ${stats.withOldPricing}`);
  console.log(`   ${stats.withNewPricing > 0 ? '✅' : '❌'} Documents with new pricing: ${stats.withNewPricing}`);
  console.log(`   ${stats.withIssues === 0 ? '✅' : '⚠️'} Documents with issues: ${stats.withIssues}`);
  console.log(`   📈 Documents with revenue data: ${stats.withRevenue}`);
  console.log(`   📊 Documents with business metrics: ${stats.withMetrics}`);

  // Check critical documents
  console.log(`\n🎯 Checking Critical Documents:`);
  const criticalChecks = checkSpecificDocuments();
  
  criticalChecks.forEach(doc => {
    if (!doc.found) {
      console.log(`   ⚠️  ${doc.file}: NOT FOUND`);
    } else if (doc.error) {
      console.log(`   ❌ ${doc.file}: ERROR`);
    } else {
      console.log(`   📄 ${doc.file}:`);
      console.log(`      ${!doc.hasOldPrice ? '✅' : '❌'} Old pricing removed`);
      console.log(`      ${doc.hasNewPrice ? '✅' : '❌'} New pricing present`);
      console.log(`      ${doc.issues.length === 0 ? '✅' : '⚠️'} No issues (${doc.issues.length} issues)`);
    }
  });

  // Detailed issue report
  const docsWithIssues = analyses.filter(a => a.issues.length > 0 || a.hasOldPrice);
  
  if (docsWithIssues.length > 0) {
    console.log(`\n🚨 Documents Needing Updates:`);
    
    docsWithIssues.forEach(doc => {
      console.log(`\n   📄 ${doc.file}:`);
      
      if (doc.hasOldPrice) {
        console.log(`      ❌ Contains old $4.99 pricing (${doc.oldPriceReferences.length} references)`);
        doc.oldPriceReferences.slice(0, 3).forEach(ref => {
          console.log(`         Line ${ref.line}: ${ref.text.substring(0, 80)}...`);
        });
      }
      
      doc.issues.forEach(issue => {
        console.log(`      ⚠️  ${issue}`);
      });
    });
  }

  // Validate business calculations
  console.log(`\n💰 Validating Business Calculations:`);
  const calculations = validateBusinessCalculations(analyses);
  
  if (calculations.length === 0) {
    console.log(`   ⚠️  No revenue calculations found in documentation`);
  } else {
    console.log(`   📊 Found ${calculations.length} revenue calculation(s)`);
    
    const oldCalcs = calculations.filter(c => c.usesOldPricing).length;
    const newCalcs = calculations.filter(c => c.usesNewPricing).length;
    
    console.log(`   ${oldCalcs === 0 ? '✅' : '❌'} Calculations using old pricing: ${oldCalcs}`);
    console.log(`   ${newCalcs > 0 ? '✅' : '❌'} Calculations using new pricing: ${newCalcs}`);
    
    // Show examples
    calculations.slice(0, 3).forEach(calc => {
      console.log(`   Example: "${calc.calculation}" in ${path.basename(calc.file)}`);
    });
  }

  // Feature description check
  console.log(`\n📋 Checking Feature Descriptions:`);
  const featureDocs = analyses.filter(a => a.featureDescriptions.length > 0);
  
  if (featureDocs.length === 0) {
    console.log(`   ⚠️  No feature descriptions found`);
  } else {
    console.log(`   ✅ Found feature descriptions in ${featureDocs.length} document(s)`);
    
    featureDocs.forEach(doc => {
      console.log(`   📄 ${path.basename(doc.file)}:`);
      doc.featureDescriptions.slice(0, 2).forEach(feature => {
        console.log(`      "${feature.text.substring(0, 80)}..."`);
      });
    });
  }

  // Final summary
  console.log(`\n📊 DOCUMENTATION SUMMARY:`);
  const checks = [
    { name: 'Documentation exists', passed: analyses.length > 0 },
    { name: 'No old pricing', passed: stats.withOldPricing === 0 },
    { name: 'Has new pricing', passed: stats.withNewPricing > 0 },
    { name: 'Critical docs updated', passed: criticalChecks.filter(d => d.found && !d.hasOldPrice).length > 0 },
    { name: 'Revenue calcs updated', passed: calculations.filter(c => c.usesNewPricing).length > 0 }
  ];

  const passed = checks.filter(c => c.passed).length;
  console.log(`✅ Passed: ${passed}/${checks.length}`);
  console.log(`📈 Success Rate: ${Math.round((passed/checks.length)*100)}%`);

  if (passed === checks.length) {
    console.log('\n🎉 All documentation is consistent with new $9.99 pricing!');
  } else {
    console.log('\n🚨 Documentation consistency issues:');
    checks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name}`);
    });
    
    console.log('\n💡 Recommendations:');
    if (stats.withOldPricing > 0) {
      console.log(`   - Update ${stats.withOldPricing} document(s) still showing $4.99`);
    }
    if (calculations.filter(c => c.usesOldPricing).length > 0) {
      console.log('   - Recalculate revenue projections with $9.99 pricing');
    }
    if (stats.withNewPricing === 0) {
      console.log('   - Add new $9.99 pricing information to key documents');
    }
  }
}

runDocumentationCheck();
