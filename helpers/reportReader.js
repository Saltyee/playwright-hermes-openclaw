const fs = require('fs');
const path = require('path');

const DEFAULT_REPORT_PATH = path.resolve(
  __dirname,
  '../reports/playwright/results.json',
);
const DETAIL_LEVELS = new Set(['summary', 'details', 'failures']);

function getErrorMessage(result) {
  const error = result?.error || result?.errors?.[0];
  if (!error) return undefined;

  const message = typeof error === 'string' ? error : error.message || error.value;
  if (!message) return undefined;

  return String(message)
    .replace(/\u001b\[[0-9;]*m/g, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)
    ?.slice(0, 500);
}

function getTestStatus(test, results) {
  const expectedStatus = test?.expectedStatus || 'passed';
  const latestResult = results.at(-1);

  if (expectedStatus === 'skipped' || latestResult?.status === 'skipped') {
    return 'skipped';
  }

  if (!latestResult || latestResult.status !== expectedStatus) {
    return 'failed';
  }

  const hadFailedAttempt = results
    .slice(0, -1)
    .some((result) => result.status !== expectedStatus);

  return hadFailedAttempt ? 'flaky' : 'passed';
}

function collectTests(suite, parentTitles = [], tests = []) {
  if (!suite || typeof suite !== 'object') return tests;

  const suiteTitles = suite.title
    ? [...parentTitles, suite.title]
    : parentTitles;

  for (const spec of Array.isArray(suite.specs) ? suite.specs : []) {
    for (const test of Array.isArray(spec.tests) ? spec.tests : []) {
      const results = Array.isArray(test.results) ? test.results : [];
      const latestResult = results.at(-1);
      const status = getTestStatus(test, results);
      const entry = {
        title: spec.title || test.title || 'Unnamed test',
        suite: suiteTitles.filter(Boolean).join(' › ') || undefined,
        file: spec.file || suite.file || undefined,
        project: test.projectName || test.projectId || undefined,
        status,
        duration: results.reduce(
          (total, result) => total + (Number(result.duration) || 0),
          0,
        ),
        retries: Math.max(0, results.length - 1),
      };

      if (status === 'failed') {
        entry.error = getErrorMessage(latestResult);
      }

      tests.push(entry);
    }
  }

  for (const childSuite of Array.isArray(suite.suites) ? suite.suites : []) {
    collectTests(childSuite, suiteTitles, tests);
  }

  return tests;
}

function buildSummary(report, reportPath, detailLevel, fileStats) {
  const tests = [];

  for (const suite of Array.isArray(report.suites) ? report.suites : []) {
    collectTests(suite, [], tests);
  }

  const counts = tests.reduce(
    (summary, test) => {
      summary[test.status] += 1;
      return summary;
    },
    { passed: 0, failed: 0, skipped: 0, flaky: 0 },
  );
  const reportErrors = Array.isArray(report.errors) ? report.errors : [];
  const generatedAt = report.stats?.startTime || fileStats.mtime.toISOString();
  const duration = Number(report.stats?.duration);
  const status =
    counts.failed > 0 || reportErrors.length > 0
      ? 'FAILED'
      : tests.length === 0
        ? 'NO_TESTS'
        : 'PASSED';

  const summary = {
    reportFound: true,
    status,
    suite: report.config?.metadata?.suite || 'Unknown',
    total: tests.length,
    passed: counts.passed,
    failed: counts.failed,
    skipped: counts.skipped,
    flaky: counts.flaky,
    duration: Number.isFinite(duration)
      ? duration
      : tests.reduce((total, test) => total + test.duration, 0),
    generatedAt,
    ageMs: Math.max(0, Date.now() - new Date(generatedAt).getTime()),
    detailLevel,
  };

  if (detailLevel === 'details') {
    summary.tests = tests;
  }

  if (detailLevel === 'failures') {
    summary.tests = tests.filter((test) => test.status === 'failed');
  }

  if (reportErrors.length > 0) {
    summary.reportError = getErrorMessage({ error: reportErrors[0] });
  }

  return summary;
}

function readLatestReport(options = {}) {
  const reportPath = path.resolve(options.reportPath || DEFAULT_REPORT_PATH);
  const detailLevel = options.detailLevel || 'summary';

  if (!DETAIL_LEVELS.has(detailLevel)) {
    return {
      reportFound: false,
      status: 'REPORT_INVALID',
      reason: `Unsupported detail level: ${detailLevel}`,
    };
  }

  if (!fs.existsSync(reportPath)) {
    return {
      reportFound: false,
      status: 'REPORT_NOT_FOUND',
      reason: 'No Playwright JSON report has been generated yet.',
    };
  }

  try {
    const fileStats = fs.statSync(reportPath);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    return buildSummary(report, reportPath, detailLevel, fileStats);
  } catch (error) {
    return {
      reportFound: false,
      status: 'REPORT_INVALID',
      reason: error instanceof SyntaxError
        ? 'The Playwright JSON report is not valid JSON.'
        : 'The Playwright JSON report could not be read.',
    };
  }
}

if (require.main === module) {
  const detailLevel = process.argv[2] || 'summary';
  console.log(JSON.stringify(readLatestReport({ detailLevel }), null, 2));
}

module.exports = {
  DEFAULT_REPORT_PATH,
  readLatestReport,
};
