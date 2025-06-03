// src/dashboard/dto/dashboard.dto.ts

export class AdminDashboardDto {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  totalStoreOwners: number;
  totalNormalUsers: number;
  storesWithAverageRatings:any;
  enrichedUsers:any
  recentUsers: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }[];
  
  recentStores: {
    id: number;
    name: string;
    email: string;
    ownerName: string;
    createdAt: Date;
  }[];
  
  topRatedStores: {
    id: number;
    name: string;
    averageRating: number;
    totalRatings: number;
  }[];
  
  userGrowth: {
    month: string;
    count: number;
  }[];
  
  storeGrowth: {
    month: string;
    count: number;
  }[];
}

export class StoreOwnerDashboardDto {
  storeId: number;
  storeName: string;
  totalRatings: number;
  averageRating: number;
  
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  
  recentRatings: {
    id: number;
    rating: number;
    userName: string;
    createdAt: Date;
  }[];
  
  ratingTrend: {
    month: string;
    averageRating: number;
    totalRatings: number;
  }[];
}