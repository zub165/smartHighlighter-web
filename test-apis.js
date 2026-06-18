#!/usr/bin/env node

/**
 * Smart Highlighter Reader - API Testing Script
 * Run this script to verify all backend APIs are working
 */

const http = require('http');

const BASE_URL = 'http://localhost:3005';
const TEST_DATA = {
  text: 'This is a test text for API validation.',
  difficulty: 'easy',
  questionCount: 3,
  cardCount: 5,
  title: 'Test Note',
  content: 'Test content for validation',
  tags: ['test', 'validation'],
  category: 'test'
};

// Test Results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test Functions
async function testHealthCheck() {
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200 && response.data.status === 'ok') {
      return { success: true, message: 'Health check passed' };
    } else {
      return { success: false, message: `Health check failed: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Health check error: ${error.message}` };
  }
}

async function testCreateQuiz() {
  try {
    const response = await makeRequest('POST', '/api/create-quiz', {
      text: TEST_DATA.text,
      difficulty: TEST_DATA.difficulty,
      questionCount: TEST_DATA.questionCount
    });
    
    if (response.status === 200 && response.data.success) {
      return { success: true, message: 'Quiz creation passed' };
    } else {
      return { success: false, message: `Quiz creation failed: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Quiz creation error: ${error.message}` };
  }
}

async function testCreateFlashcards() {
  try {
    const response = await makeRequest('POST', '/api/create-flashcards', {
      text: TEST_DATA.text,
      cardCount: TEST_DATA.cardCount
    });
    
    if (response.status === 200 && response.data.success) {
      return { success: true, message: 'Flashcard creation passed' };
    } else {
      return { success: false, message: `Flashcard creation failed: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Flashcard creation error: ${error.message}` };
  }
}

async function testStudyNotes() {
  try {
    // Test GET
    const getResponse = await makeRequest('GET', '/api/study-notes');
    if (getResponse.status !== 200) {
      return { success: false, message: `Study notes GET failed: ${getResponse.status}` };
    }
    
    // Test POST
    const postResponse = await makeRequest('POST', '/api/study-notes', {
      title: TEST_DATA.title,
      content: TEST_DATA.content,
      tags: TEST_DATA.tags,
      category: TEST_DATA.category
    });
    
    if (postResponse.status === 200 && postResponse.data.success) {
      return { success: true, message: 'Study notes API passed' };
    } else {
      return { success: false, message: `Study notes POST failed: ${postResponse.status}` };
    }
  } catch (error) {
    return { success: false, message: `Study notes error: ${error.message}` };
  }
}

async function testBookmarks() {
  try {
    // Test GET
    const getResponse = await makeRequest('GET', '/api/bookmarks');
    if (getResponse.status !== 200) {
      return { success: false, message: `Bookmarks GET failed: ${getResponse.status}` };
    }
    
    // Test POST
    const postResponse = await makeRequest('POST', '/api/bookmarks', {
      title: TEST_DATA.title,
      content: TEST_DATA.content,
      tags: TEST_DATA.tags,
      source: 'test'
    });
    
    if (postResponse.status === 200 && postResponse.data.success) {
      return { success: true, message: 'Bookmarks API passed' };
    } else {
      return { success: false, message: `Bookmarks POST failed: ${postResponse.status}` };
    }
  } catch (error) {
    return { success: false, message: `Bookmarks error: ${error.message}` };
  }
}

async function testExportAPIs() {
  try {
    // Test PDF Export
    const pdfResponse = await makeRequest('POST', '/api/export-pdf', {
      content: TEST_DATA.content,
      filename: 'test-export'
    });
    
    if (pdfResponse.status !== 200) {
      return { success: false, message: `PDF export failed: ${pdfResponse.status}` };
    }
    
    // Test Notes Export
    const notesResponse = await makeRequest('POST', '/api/export-notes', {
      notes: TEST_DATA.content,
      format: 'txt'
    });
    
    if (notesResponse.status === 200 && notesResponse.data.success) {
      return { success: true, message: 'Export APIs passed' };
    } else {
      return { success: false, message: `Notes export failed: ${notesResponse.status}` };
    }
  } catch (error) {
    return { success: false, message: `Export APIs error: ${error.message}` };
  }
}

async function testFileProcessing() {
  try {
    const response = await makeRequest('POST', '/api/process-files', {
      files: [
        { name: 'test1.jpg', size: 1024, type: 'image/jpeg' },
        { name: 'test2.jpg', size: 2048, type: 'image/jpeg' }
      ]
    });
    
    if (response.status === 200 && response.data.success) {
      return { success: true, message: 'File processing API passed' };
    } else {
      return { success: false, message: `File processing failed: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `File processing error: ${error.message}` };
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('🚀 Starting Smart Highlighter Reader API Tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Create Quiz', fn: testCreateQuiz },
    { name: 'Create Flashcards', fn: testCreateFlashcards },
    { name: 'Study Notes', fn: testStudyNotes },
    { name: 'Bookmarks', fn: testBookmarks },
    { name: 'Export APIs', fn: testExportAPIs },
    { name: 'File Processing', fn: testFileProcessing }
  ];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}...`);
    try {
      const result = await test.fn();
      if (result.success) {
        console.log(`✅ ${test.name}: PASSED`);
        results.passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED - ${result.message}`);
        results.failed++;
      }
      results.tests.push({ name: test.name, ...result });
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      results.failed++;
      results.tests.push({ name: test.name, success: false, message: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.success).forEach(t => {
      console.log(`  - ${t.name}: ${t.message}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Your Smart Highlighter Reader is ready!');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, results };
