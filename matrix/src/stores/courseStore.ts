import { makeAutoObservable, runInAction } from 'mobx';
import apiClient from '../services/apiClient';
import type {
  Course,
  CourseDetail,
  CatalogFilters,
  PaginatedResponse,
} from '../types/api';

class CourseStore {
  // Catalog state
  catalog: Course[] = [];
  totalCourses: number = 0;
  totalPages: number = 0;

  // Current course detail
  currentCourse: CourseDetail | null = null;

  // Filters
  filters: CatalogFilters = {
    page: 1,
    limit: 12,
    search: undefined,
    categoryId: undefined,
  };

  // Loading states
  isLoading: boolean = false;
  isLoadingDetails: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed properties
  get hasNextPage(): boolean {
    return this.filters.page < this.totalPages;
  }

  get hasPrevPage(): boolean {
    return this.filters.page > 1;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.catalog.length === 0;
  }

  // Fetch catalog with current filters
  async fetchCatalog(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', this.filters.page.toString());
      params.append('limit', this.filters.limit.toString());

      if (this.filters.search) {
        params.append('search', this.filters.search);
      }
      if (this.filters.categoryId) {
        params.append('categoryId', this.filters.categoryId);
      }

      const response = await apiClient.get<PaginatedResponse<Course>>(
        `/courses?${params.toString()}`
      );

      runInAction(() => {
        this.catalog = response.data.data;
        this.totalCourses = response.data.meta.total;
        this.totalPages = response.data.meta.totalPages;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Failed to fetch courses';
      });
    }
  }

  // Fetch single course details
  async fetchCourseDetails(id: string): Promise<void> {
    this.isLoadingDetails = true;
    this.error = null;
    this.currentCourse = null;

    try {
      const response = await apiClient.get<CourseDetail>(`/courses/${id}`);

      runInAction(() => {
        this.currentCourse = response.data;
        this.isLoadingDetails = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoadingDetails = false;
        this.error = error instanceof Error ? error.message : 'Failed to fetch course details';
      });
    }
  }

  // Set a single filter and re-fetch
  setFilter<K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]): void {
    // Reset to page 1 when changing search or category
    if (key === 'search' || key === 'categoryId') {
      this.filters.page = 1;
    }
    this.filters[key] = value;
    this.fetchCatalog();
  }

  // Set multiple filters at once
  setFilters(newFilters: Partial<CatalogFilters>): void {
    // Reset to page 1 if search or category changed
    if ('search' in newFilters || 'categoryId' in newFilters) {
      this.filters.page = 1;
    }
    this.filters = { ...this.filters, ...newFilters };
    this.fetchCatalog();
  }

  // Reset filters to default
  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: 12,
      search: undefined,
      categoryId: undefined,
    };
    this.fetchCatalog();
  }

  // Pagination helpers
  nextPage(): void {
    if (this.hasNextPage) {
      this.setFilter('page', this.filters.page + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage) {
      this.setFilter('page', this.filters.page - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.setFilter('page', page);
    }
  }

  // Clear current course when leaving detail page
  clearCurrentCourse(): void {
    this.currentCourse = null;
  }

  // Clear error
  clearError(): void {
    this.error = null;
  }
}

export default CourseStore;

