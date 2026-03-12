package product

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

var (
	ErrProductNotFound  = errors.New("product not found")
	ErrProductSlugTaken = errors.New("product slug already taken")
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, req *CreateProductRequest) (*Product, error) {
	status := req.Status
	if status == "" {
		status = "active"
	}
	imageURLs := req.ImageURLs
	if imageURLs == nil {
		imageURLs = []string{}
	}

	var p Product
	err := r.db.QueryRowxContext(ctx, `
		INSERT INTO products (name, slug, description, price, category_id, image_urls, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, slug, description, price, category_id, image_urls, status, created_at, updated_at`,
		req.Name, req.Slug, req.Description, req.Price, req.CategoryID,
		pq.Array(imageURLs), status,
	).StructScan(&p)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *Repository) GetByID(ctx context.Context, id int64) (*Product, error) {
	var p Product
	err := r.db.GetContext(ctx, &p, `
		SELECT id, name, slug, description, price, category_id, image_urls, status, created_at, updated_at
		FROM products WHERE id = $1`, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrProductNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *Repository) GetBySlug(ctx context.Context, slug string) (*Product, error) {
	var p Product
	err := r.db.GetContext(ctx, &p, `
		SELECT id, name, slug, description, price, category_id, image_urls, status, created_at, updated_at
		FROM products WHERE slug = $1`, slug)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrProductNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *Repository) List(ctx context.Context, params *ListParams) (*PaginatedResponse, error) {
	where := "WHERE 1=1"
	args := []interface{}{}
	argIdx := 1

	if params.CategoryID != nil {
		where += fmt.Sprintf(" AND category_id = $%d", argIdx)
		args = append(args, *params.CategoryID)
		argIdx++
	}
	if params.Status != "" {
		where += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, params.Status)
		argIdx++
	}
	if params.Search != "" {
		where += fmt.Sprintf(" AND (name ILIKE $%d OR description ILIKE $%d)", argIdx, argIdx)
		args = append(args, "%"+params.Search+"%")
		argIdx++
	}

	// Count total
	var total int
	countQuery := "SELECT COUNT(*) FROM products " + where
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, err
	}

	// Validate sort column (whitelist)
	sortCol := "created_at"
	switch params.SortBy {
	case "price":
		sortCol = "price"
	case "name":
		sortCol = "name"
	case "created_at":
		sortCol = "created_at"
	}
	sortOrder := "DESC"
	if params.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	// Fetch rows
	query := fmt.Sprintf(`
		SELECT id, name, slug, description, price, category_id, image_urls, status, created_at, updated_at
		FROM products %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d`,
		where, sortCol, sortOrder, argIdx, argIdx+1)
	args = append(args, params.Limit, params.Offset())

	var products []Product
	err = r.db.SelectContext(ctx, &products, query, args...)
	if err != nil {
		return nil, err
	}
	if products == nil {
		products = []Product{}
	}

	totalPages := total / params.Limit
	if total%params.Limit > 0 {
		totalPages++
	}

	return &PaginatedResponse{
		Data:       products,
		Total:      total,
		Page:       params.Page,
		Limit:      params.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) Update(ctx context.Context, id int64, req *UpdateProductRequest) (*Product, error) {
	// Build dynamic UPDATE query
	sets := []string{}
	args := []interface{}{}
	argIdx := 1

	if req.Name != nil {
		sets = append(sets, fmt.Sprintf("name = $%d", argIdx))
		args = append(args, *req.Name)
		argIdx++
	}
	if req.Slug != nil {
		sets = append(sets, fmt.Sprintf("slug = $%d", argIdx))
		args = append(args, *req.Slug)
		argIdx++
	}
	if req.Description != nil {
		sets = append(sets, fmt.Sprintf("description = $%d", argIdx))
		args = append(args, *req.Description)
		argIdx++
	}
	if req.Price != nil {
		sets = append(sets, fmt.Sprintf("price = $%d", argIdx))
		args = append(args, *req.Price)
		argIdx++
	}
	if req.CategoryID != nil {
		sets = append(sets, fmt.Sprintf("category_id = $%d", argIdx))
		args = append(args, *req.CategoryID)
		argIdx++
	}
	if req.ImageURLs != nil {
		sets = append(sets, fmt.Sprintf("image_urls = $%d", argIdx))
		args = append(args, pq.Array(req.ImageURLs))
		argIdx++
	}
	if req.Status != nil {
		sets = append(sets, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, *req.Status)
		argIdx++
	}

	if len(sets) == 0 {
		return r.GetByID(ctx, id)
	}

	sets = append(sets, "updated_at = NOW()")

	query := fmt.Sprintf(`UPDATE products SET %s WHERE id = $%d
		RETURNING id, name, slug, description, price, category_id, image_urls, status, created_at, updated_at`,
		joinStrings(sets, ", "), argIdx)
	args = append(args, id)

	var p Product
	err := r.db.QueryRowxContext(ctx, query, args...).StructScan(&p)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrProductNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *Repository) Delete(ctx context.Context, id int64) error {
	result, err := r.db.ExecContext(ctx,
		`DELETE FROM products WHERE id = $1`, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return ErrProductNotFound
	}
	return nil
}

func joinStrings(strs []string, sep string) string {
	result := ""
	for i, s := range strs {
		if i > 0 {
			result += sep
		}
		result += s
	}
	return result
}
