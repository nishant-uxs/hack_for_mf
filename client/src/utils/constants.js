export const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage Overflow', icon: '🗑️' },
  { value: 'water_leakage', label: 'Water Leakage', icon: '💧' },
  { value: 'streetlight', label: 'Broken Streetlight', icon: '💡' },
  { value: 'drainage', label: 'Drainage Issue', icon: '🚰' },
  { value: 'road_damage', label: 'Road Damage', icon: '🛣️' },
  { value: 'other', label: 'Other', icon: '📋' }
];

export const STATUS_COLORS = {
  Reported: 'bg-yellow-100 text-yellow-800',
  Verified: 'bg-blue-100 text-blue-800',
  InProgress: 'bg-purple-100 text-purple-800',
  Resolved: 'bg-green-100 text-green-800'
};

export const STATUS_LABELS = {
  Reported: 'Reported',
  Verified: 'Verified',
  InProgress: 'In Progress',
  Resolved: 'Resolved'
};

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

export const DEFAULT_CENTER = [77.5946, 12.9716];

export const getCategoryLabel = (value) => {
  const category = CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
};

export const getCategoryIcon = (value) => {
  const category = CATEGORIES.find(cat => cat.value === value);
  return category ? category.icon : '📋';
};
