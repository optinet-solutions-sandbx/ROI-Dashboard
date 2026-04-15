import { describe, it, expect } from 'vitest';
import { processKPIs, getInsights } from './kpiEngine';

describe('processKPIs', () => {
  it('sums revenue, cost, profit across rows', () => {
    const data = [
      { revenue: 1000, cost: 400, ftds: 10, clicks: 200, registrations: 50 },
      { revenue: 500,  cost: 200, ftds: 5,  clicks: 100, registrations: 25 },
    ];
    const result = processKPIs(data);
    expect(result.revenue).toBe(1500);
    expect(result.cost).toBe(600);
    expect(result.profit).toBe(900);
    expect(result.ftds).toBe(15);
  });

  it('calculates ROI as profit/cost', () => {
    const result = processKPIs([{ revenue: 1000, cost: 400 }]);
    expect(result.roi).toBeCloseTo(1.5);
  });

  it('returns roi=0 when cost is 0', () => {
    const result = processKPIs([{ revenue: 100, cost: 0 }]);
    expect(result.roi).toBe(0);
  });

  it('calculates cpa as cost/ftds', () => {
    const result = processKPIs([{ revenue: 500, cost: 300, ftds: 10 }]);
    expect(result.cpa).toBe(30);
  });

  it('calculates conversion_rate as ftds/clicks', () => {
    const result = processKPIs([{ clicks: 200, ftds: 10 }]);
    expect(result.conversion_rate).toBeCloseTo(0.05);
  });
});

describe('getInsights', () => {
  it('ranks top affiliates by profit descending', () => {
    const data = [
      { affiliate_id: 'A1', revenue: 1000, cost: 200 },
      { affiliate_id: 'A2', revenue: 300,  cost: 100 },
      { affiliate_id: 'A1', revenue: 500,  cost: 100 },
    ];
    const { top_affiliates } = getInsights(data);
    expect(top_affiliates[0]).toBe('A1');
  });

  it('identifies worst affiliates with negative ROI', () => {
    const data = [
      { affiliate_id: 'loser',  revenue: 100, cost: 500 },
      { affiliate_id: 'winner', revenue: 500, cost: 100 },
    ];
    const { worst_affiliates } = getInsights(data);
    expect(worst_affiliates).toContain('loser');
    expect(worst_affiliates).not.toContain('winner');
  });

  it('returns empty worst_affiliates when all ROIs are positive', () => {
    const data = [{ affiliate_id: 'good', revenue: 500, cost: 100 }];
    const { worst_affiliates } = getInsights(data);
    expect(worst_affiliates).toHaveLength(0);
  });
});
