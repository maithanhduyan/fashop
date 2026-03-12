package order

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

var (
	ErrEmptyCart     = errors.New("cart is empty")
	ErrOrderNotFound = errors.New("order not found")
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

// Checkout creates an order from the user's cart in a single transaction.
func (r *Repository) Checkout(ctx context.Context, userID int64, req *CheckoutRequest) (*Order, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Get cart items with latest product prices (lock cart rows)
	type cartRow struct {
		ProductID int64  `db:"product_id"`
		Quantity  int    `db:"quantity"`
		Name      string `db:"product_name"`
		Price     int64  `db:"product_price"`
	}
	var cartItems []cartRow
	err = tx.SelectContext(ctx, &cartItems, `
		SELECT ci.product_id, ci.quantity, p.name AS product_name, p.price AS product_price
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = $1
		FOR UPDATE OF ci`, userID)
	if err != nil {
		return nil, err
	}
	if len(cartItems) == 0 {
		return nil, ErrEmptyCart
	}

	// 2. Calculate total
	var total int64
	for _, ci := range cartItems {
		total += ci.Price * int64(ci.Quantity)
	}

	// 3. Create order
	var o Order
	err = tx.QueryRowxContext(ctx, `
		INSERT INTO orders (user_id, status, total, shipping_name, shipping_phone, shipping_address, note)
		VALUES ($1, 'pending', $2, $3, $4, $5, $6)
		RETURNING id, user_id, status, total, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at`,
		userID, total, req.ShippingName, req.ShippingPhone, req.ShippingAddress, req.Note).StructScan(&o)
	if err != nil {
		return nil, err
	}

	// 4. Create order items (snapshot product name + price at checkout time)
	o.Items = make([]OrderItem, len(cartItems))
	for i, ci := range cartItems {
		var oi OrderItem
		err = tx.QueryRowxContext(ctx, `
			INSERT INTO order_items (order_id, product_id, name, price, quantity)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, order_id, product_id, name, price, quantity, created_at`,
			o.ID, ci.ProductID, ci.Name, ci.Price, ci.Quantity).StructScan(&oi)
		if err != nil {
			return nil, err
		}
		o.Items[i] = oi
	}

	// 5. Clear cart
	if _, err = tx.ExecContext(ctx, "DELETE FROM cart_items WHERE user_id = $1", userID); err != nil {
		return nil, err
	}

	return &o, tx.Commit()
}

func (r *Repository) GetByID(ctx context.Context, id, userID int64) (*Order, error) {
	var o Order
	err := r.db.GetContext(ctx, &o, `
		SELECT id, user_id, status, total, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at
		FROM orders WHERE id = $1 AND user_id = $2`, id, userID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrOrderNotFound
	}
	if err != nil {
		return nil, err
	}
	return r.loadItems(ctx, &o)
}

func (r *Repository) GetByIDAdmin(ctx context.Context, id int64) (*Order, error) {
	var o Order
	err := r.db.GetContext(ctx, &o, `
		SELECT id, user_id, status, total, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at
		FROM orders WHERE id = $1`, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrOrderNotFound
	}
	if err != nil {
		return nil, err
	}
	return r.loadItems(ctx, &o)
}

func (r *Repository) loadItems(ctx context.Context, o *Order) (*Order, error) {
	var items []OrderItem
	err := r.db.SelectContext(ctx, &items, `
		SELECT id, order_id, product_id, name, price, quantity, created_at
		FROM order_items WHERE order_id = $1 ORDER BY id`, o.ID)
	if err != nil {
		return nil, err
	}
	if items == nil {
		items = []OrderItem{}
	}
	o.Items = items
	return o, nil
}

func (r *Repository) ListByUser(ctx context.Context, userID int64, params *ListParams) (*PaginatedResponse, error) {
	where := "WHERE user_id = $1"
	args := []interface{}{userID}
	argIdx := 2

	if params.Status != "" {
		where += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, params.Status)
		argIdx++
	}

	var total int
	if err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM orders "+where, args...); err != nil {
		return nil, err
	}

	query := fmt.Sprintf(`
		SELECT id, user_id, status, total, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at
		FROM orders %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, where, argIdx, argIdx+1)
	args = append(args, params.Limit, params.Offset())

	var orders []Order
	if err := r.db.SelectContext(ctx, &orders, query, args...); err != nil {
		return nil, err
	}
	if orders == nil {
		orders = []Order{}
	}

	totalPages := total / params.Limit
	if total%params.Limit > 0 {
		totalPages++
	}

	return &PaginatedResponse{Data: orders, Total: total, Page: params.Page, Limit: params.Limit, TotalPages: totalPages}, nil
}

func (r *Repository) ListAll(ctx context.Context, params *ListParams) (*PaginatedResponse, error) {
	where := "WHERE 1=1"
	args := []interface{}{}
	argIdx := 1

	if params.Status != "" {
		where += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, params.Status)
		argIdx++
	}

	var total int
	if err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM orders "+where, args...); err != nil {
		return nil, err
	}

	query := fmt.Sprintf(`
		SELECT id, user_id, status, total, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at
		FROM orders %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, where, argIdx, argIdx+1)
	args = append(args, params.Limit, params.Offset())

	var orders []Order
	if err := r.db.SelectContext(ctx, &orders, query, args...); err != nil {
		return nil, err
	}
	if orders == nil {
		orders = []Order{}
	}

	totalPages := total / params.Limit
	if total%params.Limit > 0 {
		totalPages++
	}

	return &PaginatedResponse{Data: orders, Total: total, Page: params.Page, Limit: params.Limit, TotalPages: totalPages}, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id int64, status string) (*Order, error) {
	var o Order
	err := r.db.QueryRowxContext(ctx, `
		UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2
		RETURNING id, user_id, status, total, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at`,
		status, id).StructScan(&o)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrOrderNotFound
	}
	if err != nil {
		return nil, err
	}
	return r.loadItems(ctx, &o)
}
