const MODEL_LABEL_KEYS = {
  "top-categories": "topCategories",
  categories: "categories",
  products: "products",
  about: "about",
  contacts: "contacts",
  news: "news",
  blogs: "blogs",
  partners: "partners",
  sertificates: "certificates",
  certificates: "certificates",
  licenses: "licenses",
  "vendors-about": "vendorsAbout",
  reviews: "reviews",
  "official-partner": "officialPartner",
  experiments: "experiments",
  "company-stats": "companyStats",
  admins: "admins",
  currencies: "currencies",
  banners: "banners",
  backgrounds: "backgrounds",
  discount: "discount",
  "select-products": "products",
  "select-reviews": "featuredReviews",
};

const MODEL_SINGULAR_LABEL_KEYS = {
  "top-categories": "topCategory",
  categories: "category",
  products: "productSingular",
  about: "about",
  contacts: "contactSingular",
  news: "newsSingular",
  blogs: "blogSingular",
  partners: "partnerSingular",
  sertificates: "projectSingular",
  certificates: "projectSingular",
  licenses: "vendorSingular",
  "vendors-about": "vendorsAbout",
  reviews: "reviewSingular",
  "official-partner": "officialPartner",
  experiments: "experimentSingular",
  "company-stats": "companyStatSingular",
  admins: "adminSingular",
  currencies: "currencySingular",
  banners: "bannerSingular",
  backgrounds: "backgroundSingular",
  discount: "discount",
  "select-products": "productSingular",
  "select-reviews": "featuredReviewSingular",
};

export function getModelLabel(modelKey, t, options = {}) {
  const { singular = false, fallback = modelKey } = options;
  const labels = singular ? MODEL_SINGULAR_LABEL_KEYS : MODEL_LABEL_KEYS;
  const translationKey = labels[modelKey];

  if (!translationKey) return fallback;

  const translatedLabel = t(translationKey);
  return translatedLabel === translationKey ? fallback : translatedLabel;
}
