/**
 * @swagger
 * components:
 *   parameters:
 *     sortParam:
 *       in: query
 *       name: sort
 *       schema:
 *         type: string
 *       description: Sort order (prefix field with - for descending) e.g. -createdAt,name
 *     fieldsParam:
 *       in: query
 *       name: fields
 *       schema:
 *         type: string
 *       description: Fields to include (comma separated) e.g. name,code,description
 *     pageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *       description: Page number for pagination
 *     limitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 25
 *         maximum: 100
 *       description: Number of records per page (max 100)
 *     searchParam:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search term for full-text search
 *     idParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Resource ID
 *
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *           description: Total number of records
 *         page:
 *           type: integer
 *           example: 1
 *           description: Current page number
 *         limit:
 *           type: integer
 *           example: 25
 *           description: Number of records per page
 *         pages:
 *           type: integer
 *           example: 4
 *           description: Total number of pages
 *         hasNext:
 *           type: boolean
 *           example: true
 *           description: Whether there is a next page
 *         hasPrev:
 *           type: boolean
 *           example: false
 *           description: Whether there is a previous page
 *
 *     FilterOperators:
 *       type: object
 *       properties:
 *         eq:
 *           type: string
 *           description: Equal to
 *         ne:
 *           type: string
 *           description: Not equal to
 *         gt:
 *           type: string
 *           description: Greater than
 *         gte:
 *           type: string
 *           description: Greater than or equal to
 *         lt:
 *           type: string
 *           description: Less than
 *         lte:
 *           type: string
 *           description: Less than or equal to
 *         in:
 *           type: array
 *           items:
 *             type: string
 *           description: In array of values
 *
 *   responses:
 *     BadRequest:
 *       description: Bad request - validation failed
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: Validation failed
 *               details:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Name is required", "Invalid status value"]
 *
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: Resource not found
 *
 *     ServerError:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: Internal server error
 *
 *     Unauthorized:
 *       description: Unauthorized - authentication required
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: Authentication required
 *
 *     Forbidden:
 *       description: Forbidden - insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: Insufficient permissions
 */

// This file only contains JSDoc documentation for Swagger components
// No actual code is needed here
