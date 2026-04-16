export interface GlobalFilters {
  searchTerm: string;
  dateRange: { start: string; end: string };
  selectedBrands: string[];
  selectedAMs: string[];
  selectedCountries: string[];
  selectedSources: string[];
  selectedPeriods: string[];
}

export interface FilterOptions {
  brands: string[];
  ams: string[];
  countries: string[];
  sources: string[];
  periods: string[];
}
