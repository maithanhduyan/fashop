package product

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

var (
	ErrCategoryNotFound  = errors.New("category not found")
	ErrCategorySlugTaken = errors.New("category slug already taken")
)

type CategoryRepository struct {
	db *sqlx.DB
}

func NewCategoryRepository(db *sqlx.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, req *CreateCategoryRequest) (*Category, error) {
	var cat Category
	err := r.db.QueryRowxContext(ctx, `
		INSERT INTO categories (name, slug)
		VALUES ($1, $2)
		RETURNING id, name, slug, created_at`,
		req.Name, req.Slug,
	).StructScan(&cat)
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

func (r *CategoryRepository) GetAll(ctx context.Context) ([]Category, error) {
	var categories []Category
	err := r.db.SelectContext(ctx, &categories,
		`SELECT id, name, slug, created_at FROM categories ORDER BY name`)
	if err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *CategoryRepository) GetByID(ctx context.Context, id int) (*Category, error) {
	var cat Category
	err := r.db.GetContext(ctx, &cat,
		`SELECT id, name, slug, created_at FROM categories WHERE id = $1`, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrCategoryNotFound
	}
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

func (r *CategoryRepository) Update(ctx context.Context, id int, req *UpdateCategoryRequest) (*Category, error) {
	var cat Category
	err := r.db.QueryRowxContext(ctx, `
		UPDATE categories SET name = $1, slug = $2
		WHERE id = $3
		RETURNING id, name, slug, created_at`,
		req.Name, req.Slug, id,
	).StructScan(&cat)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrCategoryNotFound
	}
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

func (r *CategoryRepository) Delete(ctx context.Context, id int) error {
	result, err := r.db.ExecContext(ctx,
		`DELETE FROM categories WHERE id = $1`, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return ErrCategoryNotFound
	}
	return nil
}
