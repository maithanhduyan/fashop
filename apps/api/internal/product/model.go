package product

import (
	"time"

	"github.com/lib/pq"
)

// --- Category ---

type Category struct {
	ID        int       `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Slug      string    `db:"slug" json:"slug"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required,max=100"`
	Slug string `json:"slug" binding:"required,max=100"`
}

type UpdateCategoryRequest struct {
	Name string `json:"name" binding:"required,max=100"`
	Slug string `json:"slug" binding:"required,max=100"`
}

// --- Product ---

type Product struct {
	ID          int64          `db:"id" json:"id"`
	Name        string         `db:"name" json:"name"`
	Slug        string         `db:"slug" json:"slug"`
	Description *string        `db:"description" json:"description"`
	Price       int64          `db:"price" json:"price"`
	CategoryID  *int           `db:"category_id" json:"category_id"`
	ImageURLs   pq.StringArray `db:"image_urls" json:"image_urls"`
	Status      string         `db:"status" json:"status"`
	CreatedAt   time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time      `db:"updated_at" json:"updated_at"`
}

type CreateProductRequest struct {
	Name        string   `json:"name" binding:"required,max=255"`
	Slug        string   `json:"slug" binding:"required,max=255"`
	Description *string  `json:"description"`
	Price       int64    `json:"price" binding:"required,min=0"`
	CategoryID  *int     `json:"category_id"`
	ImageURLs   []string `json:"image_urls"`
	Status      string   `json:"status" binding:"omitempty,oneof=active inactive draft"`
}

type UpdateProductRequest struct {
	Name        *string  `json:"name" binding:"omitempty,max=255"`
	Slug        *string  `json:"slug" binding:"omitempty,max=255"`
	Description *string  `json:"description"`
	Price       *int64   `json:"price" binding:"omitempty,min=0"`
	CategoryID  *int     `json:"category_id"`
	ImageURLs   []string `json:"image_urls"`
	Status      *string  `json:"status" binding:"omitempty,oneof=active inactive draft"`
}

// --- Pagination ---

type ListParams struct {
	Page       int    `form:"page,default=1" binding:"min=1"`
	Limit      int    `form:"limit,default=20" binding:"min=1,max=100"`
	CategoryID *int   `form:"category_id"`
	Status     string `form:"status"`
	Search     string `form:"search"`
	SortBy     string `form:"sort_by,default=created_at" binding:"omitempty,oneof=created_at price name"`
	SortOrder  string `form:"sort_order,default=desc" binding:"omitempty,oneof=asc desc"`
}

func (p *ListParams) Offset() int {
	return (p.Page - 1) * p.Limit
}

type PaginatedResponse struct {
	Data       []Product `json:"data"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	Limit      int       `json:"limit"`
	TotalPages int       `json:"total_pages"`
}
