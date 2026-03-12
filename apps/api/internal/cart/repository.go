package cart

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

var ErrItemNotFound = errors.New("cart item not found")

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetCart(ctx context.Context, userID int64) (*CartResponse, error) {
	items := []CartItem{}
	query := `
		SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, ci.created_at, ci.updated_at,
		       p.name AS product_name, p.slug AS product_slug, p.price AS product_price,
		       p.image_urls[1] AS product_image
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = $1
		ORDER BY ci.created_at DESC`
	if err := r.db.SelectContext(ctx, &items, query, userID); err != nil {
		return nil, err
	}

	var total int64
	for _, item := range items {
		total += item.ProductPrice * int64(item.Quantity)
	}

	return &CartResponse{Items: items, Total: total}, nil
}

func (r *Repository) AddItem(ctx context.Context, userID int64, req *AddItemRequest) (*CartItem, error) {
	var item CartItem
	query := `
		INSERT INTO cart_items (user_id, product_id, quantity)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, product_id)
		DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
		RETURNING id, user_id, product_id, quantity, created_at, updated_at`
	if err := r.db.QueryRowxContext(ctx, query, userID, req.ProductID, req.Quantity).StructScan(&item); err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *Repository) UpdateQuantity(ctx context.Context, userID, itemID int64, quantity int) (*CartItem, error) {
	var item CartItem
	query := `
		UPDATE cart_items SET quantity = $1, updated_at = NOW()
		WHERE id = $2 AND user_id = $3
		RETURNING id, user_id, product_id, quantity, created_at, updated_at`
	err := r.db.QueryRowxContext(ctx, query, quantity, itemID, userID).StructScan(&item)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrItemNotFound
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *Repository) RemoveItem(ctx context.Context, userID, itemID int64) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM cart_items WHERE id = $1 AND user_id = $2", itemID, userID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return ErrItemNotFound
	}
	return nil
}

func (r *Repository) Clear(ctx context.Context, userID int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM cart_items WHERE user_id = $1", userID)
	return err
}
