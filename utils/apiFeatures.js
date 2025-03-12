/**
 * APIFeatures - A class for handling and building MongoDB queries with advanced filtering,
 * sorting, field selection, and pagination
 */

/**
 * @class APIFeatures
 * @description Handles query building with chainable methods for filtering, sorting,
 * field selection, and pagination
 */
class APIFeatures {
  /**
   * Creates a new APIFeatures instance
   * @param {Object} query - Mongoose query object (e.g., Model.find())
   * @param {Object} queryParams - Request query parameters
   */
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  /**
   * Applies filtering to the query
   * @returns {APIFeatures} Current instance for method chaining
   * @example
   * // Basic filtering
   * ?name=John&age=25
   *
   * // Advanced filtering with operators
   * ?price[gte]=500&price[lt]=1000
   */
  filter() {
    try {
      // 1A) Create a copy of query params and exclude reserved fields
      const queryObj = { ...this.queryParams };
      const excludedFields = ["page", "sort", "limit", "fields", "search"];
      excludedFields.forEach((field) => delete queryObj[field]);

      // 1B) Advanced filtering for operators (gt, gte, lt, lte, in, etc.)
      let queryStr = JSON.stringify(queryObj);

      // Properly handle URL-encoded brackets
      queryStr = queryStr.replace(/%5B/g, "[").replace(/%5D/g, "]");

      // Convert operator syntax (e.g., price[gte]=500 to price: { $gte: 500 })
      queryStr = queryStr.replace(
        /\b(eq|ne|gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
      );

      // Parse the query string and apply it
      this.query = this.query.find(JSON.parse(queryStr));
    } catch (error) {
      console.error("Error in filter method:", error);
      // Return empty results instead of throwing
      this.query = this.query.find({ _id: null });
    }

    return this;
  }

  /**
   * Applies sorting to the query
   * @returns {APIFeatures} Current instance for method chaining
   * @example
   * // Sort by name ascending
   * ?sort=name
   *
   * // Sort by price descending and then name ascending
   * ?sort=-price,name
   */
  sort() {
    try {
      if (this.queryParams.sort) {
        const sortBy = this.queryParams.sort.split(",").join(" ");
        this.query = this.query.sort(sortBy);
      } else {
        // Default sort - can customize for your model
        this.query = this.query.sort("createdAt");
      }
    } catch (error) {
      console.error("Error in sort method:", error);
      // Keep original query without sort on error
    }

    return this;
  }

  /**
   * Limits the fields returned in the query results
   * @returns {APIFeatures} Current instance for method chaining
   * @example
   * // Return only name and price fields
   * ?fields=name,price
   *
   * // Exclude description field
   * ?fields=-description
   */
  limitFields() {
    try {
      if (this.queryParams.fields) {
        const fields = this.queryParams.fields.split(",").join(" ");
        this.query = this.query.select(fields);
      } else {
        // By default, exclude the '__v' field
        this.query = this.query.select("-__v");
      }
    } catch (error) {
      console.error("Error in limitFields method:", error);
      // Keep original query without field limits on error
    }

    return this;
  }

  /**
   * Applies pagination to the query
   * @returns {APIFeatures} Current instance for method chaining
   * @example
   * // Get page 2 with 10 items per page
   * ?page=2&limit=10
   */
  paginate() {
    try {
      // Parse page and limit with defaults
      const page = Math.max(parseInt(this.queryParams.page, 10) || 1, 1); // Minimum page 1
      const limit = Math.min(parseInt(this.queryParams.limit, 10) || 25, 100); // Maximum limit 100
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
    } catch (error) {
      console.error("Error in paginate method:", error);
      // Apply default pagination on error
      this.query = this.query.skip(0).limit(25);
    }

    return this;
  }

  /**
   * Applies text search if search parameter is provided
   * @returns {APIFeatures} Current instance for method chaining
   * @example
   * // Search for "computer science"
   * ?search=computer science
   * @requires Text index on relevant fields in MongoDB
   */
  search() {
    try {
      if (this.queryParams.search) {
        const searchTerm = this.queryParams.search.trim();

        if (searchTerm) {
          // Using MongoDB $text search (requires a text index on the fields)
          this.query = this.query.find({
            $text: { $search: searchTerm },
          });
        }
      }
    } catch (error) {
      console.error("Error in search method:", error);
      // Keep original query without search on error
    }

    return this;
  }

  /**
   * Counts the total number of documents matching the query without pagination
   * @returns {Promise<number>} Total count of matching documents
   */
  async countDocuments() {
    try {
      // Clone the query without pagination to get total count
      const countQuery = this.query.model.find(this.query.getFilter());
      return await countQuery.countDocuments();
    } catch (error) {
      console.error("Error in countDocuments method:", error);
      return 0;
    }
  }
}

module.exports = APIFeatures;
