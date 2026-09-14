const assert = require('assert');
const { CycleTracker, calculateMedian, addDays, diffInDays } = require('../cycle_tracker.js');

// Mock localStorage
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

console.log('🧪 Starting CycleTracker math and irregular cycle tests...\n');

// Test 1: calculateMedian
{
  assert.strictEqual(calculateMedian([28, 30, 32]), 30, 'Median of odd numbers');
  assert.strictEqual(calculateMedian([26, 28, 32, 34]), 30, 'Median of even numbers');
  assert.strictEqual(calculateMedian([28, 28, 29, 45]), 28.5, 'Median with single outlier');
  console.log('✓ Test 1 Passed: Median calculation resists single outliers');
}

// Test 2: Irregular Cycle window prediction with outlier exclusion
{
  const storage = new MockStorage();
  const tracker = new CycleTracker(storage);
  tracker.updateSettings({ enabled: true, isIrregular: true, periodLength: 5 });

  // Add 4 cycles:
  // Cycle 1: 2026-04-01 to 2026-04-29 (28 days)
  // Cycle 2: 2026-04-29 to 2026-05-31 (32 days)
  // Cycle 3: 2026-05-31 to 2026-07-15 (45 days - OUTLIER / severe stress or illness!)
  // Cycle 4: 2026-07-15 to current
  tracker.addCycle('2026-04-01');
  tracker.addCycle('2026-04-29');
  tracker.addCycle('2026-05-31');
  const c3 = tracker.addCycle('2026-07-15');

  // Without outlier flag, lengths are 28, 32, 45
  let analysis = tracker.analyzeCycleLengths();
  assert.strictEqual(analysis.count, 3);
  assert.strictEqual(analysis.minLen, 28);
  assert.strictEqual(analysis.maxLen, 45);
  assert.strictEqual(analysis.median, 32);

  // Now mark cycle 3 (May 31) as outlier
  const mayCycle = tracker.data.history.find(c => c.startDate === '2026-05-31');
  tracker.toggleOutlier(mayCycle.id);

  // With outlier flag set, lengths are only [28, 32]!
  analysis = tracker.analyzeCycleLengths();
  assert.strictEqual(analysis.count, 2, 'Outlier cycle was excluded from count');
  assert.strictEqual(analysis.minLen, 28, 'Min length without outlier');
  assert.strictEqual(analysis.maxLen, 32, 'Max length without outlier');
  assert.strictEqual(analysis.median, 30, 'Median without outlier');

  // Prediction from 2026-07-15
  const pred = tracker.getPrediction('2026-08-01');
  assert.strictEqual(pred.isIrregular, true);
  // Expected window: 2026-07-15 + 28 days = 2026-08-12, + 32 days = 2026-08-16
  assert.strictEqual(pred.windowStart, '2026-08-12');
  assert.strictEqual(pred.windowEnd, '2026-08-16');
  assert.strictEqual(pred.predictedCenter, '2026-08-14');
  console.log('✓ Test 2 Passed: Irregular cycle window and outlier exclusion work perfectly');
}

// Test 3: Ovulation override (+14 days luteal phase rule)
{
  const storage = new MockStorage();
  const tracker = new CycleTracker(storage);
  tracker.updateSettings({ enabled: true, isIrregular: true, lutealLength: 14 });

  // Latest cycle started 2026-08-01.
  tracker.addCycle('2026-08-01');

  // Irregular delay: on day 24 (2026-08-25), ovulation is noticed
  tracker.setOvulationDateForCurrentCycle('2026-08-25');

  const pred = tracker.getPrediction('2026-08-26');
  assert.strictEqual(pred.isOvulationOverride, true);
  // Expected center: 2026-08-25 + 14 days = 2026-09-08!
  assert.strictEqual(pred.predictedCenter, '2026-09-08');
  assert.strictEqual(pred.windowStart, '2026-09-07');
  assert.strictEqual(pred.windowEnd, '2026-09-09');
  console.log('✓ Test 3 Passed: Ovulation override correctly locks prediction to 14 days later');
}

// Test 4: Status and phase advice for daily tasks
{
  const storage = new MockStorage();
  const tracker = new CycleTracker(storage);
  tracker.updateSettings({ enabled: true });
  tracker.addCycle('2026-09-01'); // Today is 2026-09-11 -> day 11

  const status = tracker.getStatusForDate('2026-09-11');
  assert.strictEqual(status.dayInCycle, 11);
  assert.strictEqual(status.phase, 'follicular');

  const advice = tracker.getPhaseAdvice(status.phase, 'ru');
  assert(advice.title.includes('Фолликулярная'));
  assert(advice.taskTip.length > 10);
  console.log('✓ Test 4 Passed: Status and daily task productivity advice work as expected');
}

// Test 5: Period end tracking & active state toggle
{
  const storage = new MockStorage();
  const tracker = new CycleTracker(storage);
  tracker.updateSettings({ enabled: true, periodLength: 5 });

  // Start cycle on day 2026-09-08
  tracker.addCycle('2026-09-08');

  // On day 2026-09-10 (day 3), period should be active
  assert.strictEqual(tracker.isPeriodCurrentlyActive('2026-09-10'), true, 'Period is active on day 3');

  // Woman clicks "Закончились сегодня" on day 2026-09-11 (day 4)
  tracker.recordTodayAsEnd('2026-09-11');
  const latest = tracker.getLatestCycle();
  assert.strictEqual(latest.endDate, '2026-09-11', 'End date is locked to 2026-09-11');
  assert.strictEqual(latest.periodEndedExplicitly, true, 'Marked as explicitly ended');

  // Now isPeriodCurrentlyActive should be false!
  assert.strictEqual(tracker.isPeriodCurrentlyActive('2026-09-11'), false, 'Period is marked completed');
  assert.strictEqual(tracker.isPeriodCurrentlyActive('2026-09-12'), false, 'Period remains completed tomorrow');
  console.log('✓ Test 5 Passed: Period completion and dynamic button state work accurately');
}

// Test 6: Adjustable defaultCycleLength slider in predictions and ovulation math
{
  const storage = new MockStorage();
  const tracker = new CycleTracker(storage);
  tracker.updateSettings({ enabled: true, isIrregular: true, defaultCycleLength: 32 });

  // Cycle started 2026-09-01
  tracker.addCycle('2026-09-01');

  // Prediction should center on 2026-09-01 + 32 days = 2026-10-03
  let pred = tracker.getPrediction('2026-09-02');
  assert.strictEqual(pred.defaultCycleLength, 32);
  assert.strictEqual(pred.predictedCenter, '2026-10-03', 'Center adjusted to 32 days');
  assert.strictEqual(pred.windowStart, '2026-09-30', 'Window start adjusted with 32 days base (September 1 + 29 days = Sept 30)');
  assert.strictEqual(pred.windowEnd, '2026-10-09', 'Window end adjusted with 32 days base (September 1 + 38 days = Oct 09)');
  // Ovulation at day 32 - 14 = day 18: 2026-09-01 + 18 = 2026-09-19
  assert.strictEqual(pred.estOvulationCenter, '2026-09-19', 'Ovulation center shifts with cycle length');

  // Now user moves slider to 25 days!
  tracker.updateSettings({ defaultCycleLength: 25 });
  pred = tracker.getPrediction('2026-09-02');
  assert.strictEqual(pred.defaultCycleLength, 25);
  assert.strictEqual(pred.predictedCenter, '2026-09-26', 'Center adjusted to 25 days');
  // Ovulation at day 25 - 14 = day 11: 2026-09-01 + 11 = 2026-09-12
  assert.strictEqual(pred.estOvulationCenter, '2026-09-12', 'Ovulation center shifts to day 11');

  console.log('✓ Test 6 Passed: defaultCycleLength slider immediately drives prediction formulas and ovulation dates');
}

// Test 7: Living randomized phase advice across all sub-phases and languages (RU, UK, EN)
{
  const storage = new MockStorage();
  const tracker = new CycleTracker(storage);
  tracker.updateSettings({ enabled: true });

  const testCases = [
    { phase: 'menstrual', day: 1, expectedSub: 'menstrual_early' },
    { phase: 'menstrual', day: 4, expectedSub: 'menstrual_late' },
    { phase: 'follicular', day: 7, expectedSub: 'follicular_early' },
    { phase: 'follicular', day: 12, expectedSub: 'follicular_late' },
    { phase: 'ovulation', day: 15, expectedSub: 'ovulation' },
    { phase: 'luteal', day: 18, expectedSub: 'luteal_early' },
    { phase: 'luteal', day: 25, expectedSub: 'luteal_late' },
    { phase: 'luteal', day: 30, context: { inWindow: true }, expectedSub: 'overdue_window' }
  ];

  const languages = ['ru', 'uk', 'en'];

  for (const lang of languages) {
    for (const tc of testCases) {
      const subPhase = tracker.determineSubPhase(tc.phase, tc.day, tc.context || {});
      assert.strictEqual(subPhase, tc.expectedSub, `Subphase for day ${tc.day} phase ${tc.phase}`);

      const advice = tracker.getPhaseAdvice(tc.phase, lang, tc.day, tc.context || {});
      assert(advice.title && advice.title.length > 3, `Title for ${lang}/${tc.expectedSub}`);
      assert(advice.energy && advice.energy.length > 2, `Energy for ${lang}/${tc.expectedSub}`);
      assert(advice.taskTip && advice.taskTip.length > 15, `TaskTip for ${lang}/${tc.expectedSub}`);
      assert(advice.badge && advice.badge.length > 2, `Badge for ${lang}/${tc.expectedSub}`);
    }
  }

  // Verify randomization returns non-empty tips and energies
  const sampleTips = new Set();
  for (let i = 0; i < 30; i++) {
    const adv = tracker.getPhaseAdvice('follicular', 'ru', 7);
    sampleTips.add(adv.taskTip);
  }
  assert(sampleTips.size > 1, 'Multiple random tips should be returned across calls');

  console.log('✓ Test 7 Passed: Living non-scripted advice covers all sub-phases and languages with verified randomization');
}

// Test 8: Visual Cycle Orbit Ring ("Колесо биоритмов с вишенкой 🍒")
{
  const storage = new MockStorage();
  const tracker = new CycleTracker(storage);
  tracker.updateSettings({ enabled: true, defaultCycleLength: 28, periodLength: 5 });

  // 1. Unstarted tracker returns hasData: false
  const emptyOrbit = tracker.getOrbitData('2026-09-11');
  assert.strictEqual(emptyOrbit.hasData, false);
  assert.strictEqual(emptyOrbit.pointerAngleDeg, 0);

  // 2. Add cycle on 2026-09-01 -> on 2026-09-01 it is Day 1
  tracker.addCycle('2026-09-01');
  const day1Orbit = tracker.getOrbitData('2026-09-01');
  assert.strictEqual(day1Orbit.hasData, true);
  assert.strictEqual(day1Orbit.currentDay, 1);
  assert.strictEqual(day1Orbit.totalDays, 28);
  // Day 1 angle: (1 - 0.5) * (360/28) ≈ 6.43 deg
  assert(day1Orbit.pointerAngleDeg > 5 && day1Orbit.pointerAngleDeg < 8, 'Day 1 pointer angle is near 12 oclock');

  // Check 4 segments
  assert.strictEqual(day1Orbit.segments.length, 4);
  const totalSegDays = day1Orbit.segments.reduce((sum, s) => sum + s.days, 0);
  assert.strictEqual(totalSegDays, 28, '4 segments add up to total cycle length');

  // 3. Day 14 (Ovulation): angle near 180 deg (bottom half of circle)
  const day14Orbit = tracker.getOrbitData('2026-09-14');
  assert.strictEqual(day14Orbit.currentDay, 14);
  // Angle: (14 - 0.5) * (360/28) ≈ 173.57 deg
  assert(day14Orbit.pointerAngleDeg > 170 && day14Orbit.pointerAngleDeg < 180, 'Day 14 pointer angle is near 6 oclock');

  console.log('✓ Test 8 Passed: Cycle Orbit math, segments and cherry angles calculated with exact precision');
}

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
