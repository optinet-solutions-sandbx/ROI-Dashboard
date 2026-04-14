export interface PerformanceRecord {
  affiliate_id?: string;
  country?: string;
  campaign?: string;
  date?: string;
  clicks?: number;
  registrations?: number;
  ftds?: number;
  revenue?: number;
  cost?: number;
  [key: string]: any;
}

export const processKPIs = (data: PerformanceRecord[]) => {
  let initial = {
    revenue: 0,
    cost: 0,
    profit: 0,
    ftds: 0,
    clicks: 0,
    registrations: 0,
  };

  const totals = data.reduce((acc, row) => {
    acc.revenue += Number(row.revenue) || 0;
    acc.cost += Number(row.cost) || 0;
    acc.ftds += Number(row.ftds) || 0;
    acc.clicks += Number(row.clicks) || 0;
    acc.registrations += Number(row.registrations) || 0;
    return acc;
  }, initial);

  totals.profit = totals.revenue - totals.cost;
  const roi = totals.cost > 0 ? totals.profit / totals.cost : 0;
  const cpa = totals.ftds > 0 ? totals.cost / totals.ftds : 0;
  const conversion_rate = totals.clicks > 0 ? totals.ftds / totals.clicks : 0;

  return { ...totals, roi, cpa, conversion_rate };
};

export const getInsights = (data: PerformanceRecord[]) => {
  const affiliateMap: Record<string, { revenue: number, cost: number, profit: number }> = {};
  
  data.forEach(row => {
    if (!row.affiliate_id) return;
    const aff = row.affiliate_id;
    if (!affiliateMap[aff]) affiliateMap[aff] = { revenue: 0, cost: 0, profit: 0 };
    affiliateMap[aff].revenue += Number(row.revenue) || 0;
    affiliateMap[aff].cost += Number(row.cost) || 0;
    affiliateMap[aff].profit += (Number(row.revenue) || 0) - (Number(row.cost) || 0);
  });

  const affiliates = Object.keys(affiliateMap).map(id => ({
    id,
    ...affiliateMap[id],
    roi: affiliateMap[id].cost > 0 ? affiliateMap[id].profit / affiliateMap[id].cost : 0,
  }));

  const top_affiliates_list = [...affiliates].sort((a, b) => b.profit - a.profit);
  const top_affiliates = top_affiliates_list.slice(0, 5).map(a => a.id);
  
  const worst_affiliates_list = [...affiliates].sort((a, b) => a.roi - b.roi);
  const worst_affiliates = worst_affiliates_list.filter(a => a.roi < 0).slice(0, 5).map(a => a.id);

  const recommendations = [];
  if (worst_affiliates.length > 0) {
    recommendations.push(`Review poorly performing affiliates like ${worst_affiliates[0]} who have negative ROI.`);
  } else {
    recommendations.push(`All affiliates have a positive ROI. Good work!`);
  }

  if (top_affiliates.length > 0) {
    recommendations.push(`Consider incentivizing top earners like ${top_affiliates.slice(0, 2).join(' and ')} for scaling.`);
  }
  
  return { top_affiliates, worst_affiliates, recommendations };
};
